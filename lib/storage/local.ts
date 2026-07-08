import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

import { StorageDriver } from "./types";

export const UPLOAD_DIR = path.join(process.cwd(), ".uploads");

const URL_PREFIX = "/api/files/";

const sanitize = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);

export const localDriver: StorageDriver = {
  async upload(file) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const fileName = `${randomUUID()}-${sanitize(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(UPLOAD_DIR, fileName), buffer);

    return { url: `${URL_PREFIX}${fileName}`, name: file.name };
  },

  async remove(url) {
    const fileName = path.basename(url);
    try {
      await fs.unlink(path.join(UPLOAD_DIR, fileName));
    } catch (error: any) {
      if (error?.code !== "ENOENT") throw error;
    }
  },

  owns(url) {
    return url.startsWith(URL_PREFIX);
  },
};
