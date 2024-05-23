"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import ReactPlayer from "react-player";

import { cn } from "@/lib/utils";
import { useConfettiStore } from "@/hooks/use-confetti-store";

interface VideoPlayerProps {
  playbackId: string;
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
  url: string;
}

export const VideoPlayer = ({
  chapterId,
  courseId,
  nextChapterId,
  isLocked,
  completeOnEnd,
  url,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const confetti = useConfettiStore();

  useEffect(() => {}, [isReady]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onEnd = async () => {
    try {
      if (completeOnEnd) {
        await axios.put(
          `/api/courses/${courseId}/chapters/${chapterId}/progress`,
          {
            isCompleted: true,
          },
        );

        if (!nextChapterId) {
          confetti.onOpen();
        }

        toast.success("Progress updated");
        router.refresh();

        if (nextChapterId) {
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
        }
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="relative aspect-video">
      {!isReady && isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-2 bg-slate-800 text-secondary">
          <Lock className="h-8 w-8" />
          <p className="text-sm">This chapter is locked</p>
        </div>
      )}

      {!isLocked && url && isClient && (
        <ReactPlayer
          className={cn(isReady && "hidden")}
          playing
          width="100%"
          height="100%"
          onEnded={onEnd}
          onPlay={() => setIsReady(true)}
          controls={true}
          url={url}
          volume={1}
        />
      )}
    </div>
  );
};
