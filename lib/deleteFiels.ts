import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

function getFileName(url: string) {
  const urlObject = new URL(url);
  const pathname = urlObject.pathname;
  const filename = pathname.substring(pathname.lastIndexOf("/") + 1);
  return filename;
}

export { utapi, getFileName };
