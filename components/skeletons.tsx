import { Loader2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

/** Скелетон карточки курса (обложка + текст). */
export const CourseCardSkeleton = () => (
  <div className="h-full overflow-hidden rounded-lg border p-3">
    <Skeleton className="aspect-video w-full rounded-md" />
    <div className="flex flex-col gap-2 pt-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  </div>
);

/** Сетка карточек курсов. */
export const CoursesGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4">
    {Array.from({ length: count }).map((_, index) => (
      <CourseCardSkeleton key={index} />
    ))}
  </div>
);

/** Полноэкранный спиннер для страниц без специфичного скелетона. */
export const PageSpinner = () => (
  <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-sky-700" />
  </div>
);

/** Скелетон таблицы (teacher/courses). */
export const TableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="rounded-md border">
      <div className="border-b p-4">
        <Skeleton className="h-5 w-full" />
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="border-b p-4 last:border-0">
          <Skeleton className="h-5 w-full" />
        </div>
      ))}
    </div>
  </div>
);
