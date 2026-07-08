import { db } from "@/lib/db";

/** Процент завершённых глав. */
export const computeProgress = (
  totalChapters: number,
  completedChapters: number,
): number =>
  totalChapters === 0 ? 0 : (completedChapters / totalChapters) * 100;

/**
 * Прогресс по многим курсам ОДНИМ запросом (каталог, dashboard).
 * Принимает курсы с уже загруженными id опубликованных глав,
 * возвращает { courseId: percent }.
 */
export const getProgressMap = async (
  userId: string,
  courses: { id: string; chapters: { id: string }[] }[],
): Promise<Record<string, number>> => {
  const chapterIds = courses.flatMap((course) =>
    course.chapters.map((chapter) => chapter.id),
  );

  if (chapterIds.length === 0) {
    return {};
  }

  const completed = await db.userProgress.findMany({
    where: {
      userId,
      isCompleted: true,
      chapterId: { in: chapterIds },
    },
    select: { chapterId: true },
  });

  const completedIds = new Set(completed.map((progress) => progress.chapterId));

  return Object.fromEntries(
    courses.map((course) => [
      course.id,
      computeProgress(
        course.chapters.length,
        course.chapters.filter((chapter) => completedIds.has(chapter.id))
          .length,
      ),
    ]),
  );
};
