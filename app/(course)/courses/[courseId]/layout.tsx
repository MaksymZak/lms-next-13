import { auth } from "@/lib/session";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { computeProgress } from "@/actions/get-progress";

import { CourseSidebar } from "./_components/course-sidebar";
import { CourseNavbar } from "./_components/course-navbar";
import { Suspense } from "react";
import Loader from "@/components/loader/loader";

const CourseLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/");
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        include: {
          userProgress: {
            where: {
              userId,
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!course) {
    return redirect("/");
  }

  // Прогресс считаем из уже загруженных глав (без лишних запросов)
  const completedChapters = course.chapters.filter(
    (chapter) => chapter.userProgress?.[0]?.isCompleted,
  ).length;
  const progressCount = computeProgress(
    course.chapters.length,
    completedChapters,
  );

  return (
    <div className="h-full">
      <div className="fixed inset-y-0 z-50 h-[80px] w-full md:pl-80">
        <CourseNavbar course={course} progressCount={progressCount} />
      </div>
      <div className="fixed inset-y-0 z-50 hidden h-full w-80 flex-col md:flex">
        <CourseSidebar course={course} progressCount={progressCount} />
      </div>
      <main className="h-full pt-[80px] md:pl-80">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center">
              <Loader />
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
};

export default CourseLayout;
