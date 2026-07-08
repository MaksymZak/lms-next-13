import { randomUUID } from "crypto";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { StorageDriver } from "./types";

// Cloudflare R2 через S3-совместимый API.
// Настройка: docs/SETUP_R2.md. Нужные env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
// R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL (r2.dev или кастомный домен).

let client: S3Client | null = null;

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `R2 storage: missing env variable ${name} (see docs/SETUP_R2.md)`,
    );
  }
  return value;
};

const getClient = () => {
  if (!client) {
    client = new S3Client({
      region: "auto", // требуется SDK, R2 не использует
      endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
      },
    });
  }
  return client;
};

const publicUrl = () => requireEnv("R2_PUBLIC_URL").replace(/\/$/, "");

const sanitize = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);

export const r2Driver: StorageDriver = {
  async upload(file) {
    const key = `${randomUUID()}-${sanitize(file.name)}`;

    await getClient().send(
      new PutObjectCommand({
        Bucket: requireEnv("R2_BUCKET"),
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type || "application/octet-stream",
      }),
    );

    return { url: `${publicUrl()}/${key}`, name: file.name };
  },

  async remove(url) {
    const key = decodeURIComponent(
      url.slice(publicUrl().length).replace(/^\//, ""),
    );

    await getClient().send(
      new DeleteObjectCommand({
        Bucket: requireEnv("R2_BUCKET"),
        Key: key,
      }),
    );
  },

  owns(url) {
    // Без настроенного R2 драйвер не владеет никакими URL
    if (!process.env.R2_PUBLIC_URL) return false;
    return url.startsWith(publicUrl());
  },
};
