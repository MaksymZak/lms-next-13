import { Skeleton } from "@/components/ui/skeleton";
import { CoursesGridSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-x-2 overflow-x-hidden pb-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-28 shrink-0 rounded-full" />
        ))}
      </div>
      <CoursesGridSkeleton />
    </div>
  );
}
