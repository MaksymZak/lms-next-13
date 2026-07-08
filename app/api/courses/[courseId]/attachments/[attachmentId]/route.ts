import { auth } from "@/lib/session";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { deleteFileByUrl } from "@/lib/storage";

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; attachmentId: string } },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId,
      },
    });

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const attachment = await db.attachment.delete({
      where: {
        courseId: params.courseId,
        id: params.attachmentId,
      },
    });

    await deleteFileByUrl(attachment.url);

    return NextResponse.json(attachment);
  } catch (error) {
    console.log("ATTACHMENT_ID", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
