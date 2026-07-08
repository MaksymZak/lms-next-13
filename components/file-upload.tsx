"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

type UploadKind = "image" | "video" | "attachment";

const acceptByKind: Record<UploadKind, Record<string, string[]> | undefined> = {
  image: { "image/*": [] },
  video: { "video/*": [] },
  attachment: undefined, // любые файлы
};

const hintByKind: Record<UploadKind, string> = {
  image: "Image up to 4MB",
  video: "Video up to 512MB",
  attachment: "Any file up to 32MB",
};

interface FileUploadProps {
  kind: UploadKind;
  // eslint-disable-next-line
  onChange: (file?: { url: string; name: string }) => void;
}

const FileUpload = ({ kind, onChange }: FileUploadProps) => {
  const [progress, setProgress] = useState<number | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);

      setProgress(0);
      try {
        const { data } = await axios.post("/api/upload", formData, {
          onUploadProgress: (event) => {
            if (event.total) {
              setProgress(Math.round((event.loaded / event.total) * 100));
            }
          },
        });
        onChange(data);
      } catch (error: any) {
        const message =
          typeof error?.response?.data === "string"
            ? error.response.data
            : "Upload failed";
        toast.error(message);
      } finally {
        setProgress(null);
      }
    },
    [kind, onChange],
  );

  const isUploading = progress !== null;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptByKind[kind],
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-y-2 rounded-md border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:bg-slate-100",
        isDragActive && "border-sky-500 bg-sky-50",
        isUploading && "cursor-default opacity-70",
      )}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-sky-700" />
          <div className="w-full max-w-xs">
            <Progress value={progress} className="h-2" />
          </div>
          <p className="text-sm text-slate-600">Uploading… {progress}%</p>
        </>
      ) : (
        <>
          <UploadCloud className="h-8 w-8 text-slate-500" />
          <p className="text-sm font-medium text-slate-700">
            {isDragActive
              ? "Drop the file here"
              : "Drag & drop or click to upload"}
          </p>
          <p className="text-xs text-slate-500">{hintByKind[kind]}</p>
        </>
      )}
    </div>
  );
};

export default FileUpload;
