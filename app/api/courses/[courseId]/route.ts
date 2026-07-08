import { auth } from "@/lib/session";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { deleteFileByUrl } from "@/lib/storage";

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId,
      },
      include: {
        chapters: true,
        attachments: true,
      },
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    const deletedCourse = await db.course.delete({
      where: {
        id: params.courseId,
      },
    });

    // Чистим файлы курса после удаления записи (параллельно)
    await Promise.all([
      deleteFileByUrl(course.imageUrl),
      ...course.chapters.map((chapter) => deleteFileByUrl(chapter.videoUrl)),
      ...course.attachments.map((attachment) =>
        deleteFileByUrl(attachment.url),
      ),
    ]);

    return NextResponse.json(deletedCourse);
  } catch (error) {
    console.log("[COURSE_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } },
) {
  try {
    const { userId } = await auth();
    const { courseId } = params;
    const values = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Смена обложки — удаляем предыдущий файл
    if (
      values.imageUrl &&
      ownCourse.imageUrl &&
      ownCourse.imageUrl !== values.imageUrl
    ) {
      await deleteFileByUrl(ownCourse.imageUrl);
    }

    const course = await db.course.update({
      where: {
        id: courseId,
        userId,
      },
      data: {
        ...values,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSE_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
