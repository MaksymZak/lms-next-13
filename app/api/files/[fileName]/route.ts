import { createReadStream } from "fs";
import fs from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";

import { UPLOAD_DIR } from "@/lib/storage/local";

export const runtime = "nodejs";

const mimeTypes: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".mp3": "audio/mpeg",
  ".zip": "application/zip",
};

const contentType = (fileName: string) =>
  mimeTypes[path.extname(fileName).toLowerCase()] ?? "application/octet-stream";

// Раздача локально загруженных файлов с поддержкой Range (перемотка видео)
export async function GET(
  req: Request,
  { params }: { params: { fileName: string } },
) {
  // Защита от path traversal
  const fileName = path.basename(decodeURIComponent(params.fileName));
  const filePath = path.join(UPLOAD_DIR, fileName);

  let stat;
  try {
    stat = await fs.stat(filePath);
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }

  const range = req.headers.get("range");

  const baseHeaders = {
    "Content-Type": contentType(fileName),
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
  };

  if (range) {
    const match = range.match(/bytes=(\d*)-(\d*)/);
    const start = match?.[1] ? parseInt(match[1], 10) : 0;
    const end = match?.[2] ? parseInt(match[2], 10) : stat.size - 1;

    if (start >= stat.size || end >= stat.size || start > end) {
      return new NextResponse("Range Not Satisfiable", {
        status: 416,
        headers: { "Content-Range": `bytes */${stat.size}` },
      });
    }

    const stream = Readable.toWeb(
      createReadStream(filePath, { start, end }),
    ) as ReadableStream;

    return new Response(stream, {
      status: 206,
      headers: {
        ...baseHeaders,
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Content-Length": String(end - start + 1),
      },
    });
  }

  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;

  return new Response(stream, {
    status: 200,
    headers: {
      ...baseHeaders,
      "Content-Length": String(stat.size),
    },
  });
}
