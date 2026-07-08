import { NextResponse } from "next/server";

import { auth } from "@/lib/session";
import { uploadFile } from "@/lib/storage";

export const runtime = "nodejs";

// Ограничения по типам загрузок
const limits = {
  image: { maxSize: 4 * 1024 * 1024, mime: /^image\// },
  video: { maxSize: 512 * 1024 * 1024, mime: /^video\// },
  attachment: { maxSize: 32 * 1024 * 1024, mime: /.*/ },
} as const;

export type UploadKind = keyof typeof limits;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const kind = formData.get("kind") as UploadKind | null;

    if (!(file instanceof File) || !kind || !(kind in limits)) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    const { maxSize, mime } = limits[kind];

    if (!mime.test(file.type)) {
      return new NextResponse(`Invalid file type for "${kind}"`, {
        status: 400,
      });
    }

    if (file.size > maxSize) {
      return new NextResponse(
        `File is too large (max ${Math.round(maxSize / 1024 / 1024)}MB)`,
        { status: 400 },
      );
    }

    const uploaded = await uploadFile(file);

    return NextResponse.json(uploaded);
  } catch (error) {
    console.error("[UPLOAD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
