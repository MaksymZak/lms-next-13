import { Category, Course } from "@prisma/client";

import { getProgressMap } from "@/actions/get-progress";
import { db } from "@/lib/db";

type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
};

type GetCourses = {
  userId: string;
  title?: string;
  categoryId?: string;
};

export const getCourses = async ({
  userId,
  title,
  categoryId,
}: GetCourses): Promise<CourseWithProgressWithCategory[]> => {
  try {
    const courses = await db.course.findMany({
      where: {
        isPublished: true,
        title: {
          contains: title,
          mode: "insensitive",
        },
        categoryId,
      },
      include: {
        category: true,
        chapters: {
          where: {
            isPublished: true,
          },
          select: {
            id: true,
          },
        },
        purchases: {
          where: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Прогресс всех купленных курсов одним запросом (без N+1)
    const purchasedCourses = courses.filter(
      (course) => course.purchases.length > 0,
    );
    const progressMap = await getProgressMap(userId, purchasedCourses);

    return courses.map((course) => ({
      ...course,
      progress:
        course.purchases.length > 0 ? (progressMap[course.id] ?? 0) : null,
    }));
  } catch (error) {
    console.log("[GET_COURSES]", error);
    return [];
  }
};
