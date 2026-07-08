import { db } from "@/lib/db";
import { Attachment, Chapter } from "@prisma/client";

interface GetChapterProps {
  userId: string;
  courseId: string;
  chapterId: string;
}

export const getChapter = async ({
  userId,
  courseId,
  chapterId,
}: GetChapterProps) => {
  try {
    // Независимые запросы — параллельно
    const [purchase, course, chapter] = await Promise.all([
      db.purchase.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      }),
      db.course.findUnique({
        where: {
          isPublished: true,
          id: courseId,
        },
        select: {
          price: true,
        },
      }),
      db.chapter.findUnique({
        where: {
          id: chapterId,
          isPublished: true,
        },
      }),
    ]);

    if (!chapter || !course) {
      throw new Error("Chapter or course not found");
    }

    // Не отдаём URL видео закрытой главы: пропсы клиентских компонентов
    // сериализуются в HTML, даже если плеер не рендерится
    const hasAccess = chapter.isFree || !!purchase;
    if (!hasAccess) {
      chapter.videoUrl = null;
    }

    const [attachments, nextChapter, userProgress] = await Promise.all([
      purchase
        ? db.attachment.findMany({
            where: {
              courseId: courseId,
            },
          })
        : Promise.resolve([] as Attachment[]),
      hasAccess
        ? db.chapter.findFirst({
            where: {
              courseId: courseId,
              isPublished: true,
              position: {
                gt: chapter.position,
              },
            },
            orderBy: {
              position: "asc",
            },
          })
        : Promise.resolve(null as Chapter | null),
      db.userProgress.findUnique({
        where: {
          userId_chapterId: {
            userId,
            chapterId,
          },
        },
      }),
    ]);

    return {
      chapter,
      course,
      attachments,
      nextChapter,
      userProgress,
      purchase,
    };
  } catch (error) {
    console.log("[GET_CHAPTER]", error);
    return {
      chapter: null,
      course: null,
      attachments: [],
      nextChapter: null,
      userProgress: null,
      purchase: null,
    };
  }
};
