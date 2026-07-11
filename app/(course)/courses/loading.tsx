import { PageSpinner } from "@/components/skeletons";

// Ловит медленный запрос в layout курса (course + chapters + progress),
// который не покрывается loading.tsx самого сегмента [courseId].
export default function Loading() {
  return <PageSpinner />;
}
