import { db } from "@/lib/db";
import { auth } from "@/lib/session";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { courseId: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { list } = await req.json();
    const courseOwner = await db.course.findUnique({
      where: { id: params.courseId, userId },
    });

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    for (const item of list) {
      // updateMany с courseId в where гарантирует, что глава принадлежит курсу
      await db.chapter.updateMany({
        where: { id: item.id, courseId: params.courseId },
        data: {
          position: item.position,
        },
      });
    }

    return new NextResponse("Chapters reordered", { status: 200 });
  } catch (error) {
    console.log("[REORDER]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
