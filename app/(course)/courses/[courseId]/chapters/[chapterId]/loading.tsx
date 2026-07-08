import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col pb-20">
      <div className="p-4">
        <Skeleton className="aspect-video w-full rounded-md" />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
