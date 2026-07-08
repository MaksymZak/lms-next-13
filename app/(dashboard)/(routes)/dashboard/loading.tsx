import { Skeleton } from "@/components/ui/skeleton";
import { CoursesGridSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="space-y-4 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
      <CoursesGridSkeleton count={4} />
    </div>
  );
}
