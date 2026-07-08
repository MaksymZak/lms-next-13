import "server-only";

import { localDriver } from "./local";
import { r2Driver } from "./r2";
import { StorageDriver, UploadedFile } from "./types";

const drivers: Record<string, StorageDriver> = {
  local: localDriver,
  r2: r2Driver,
};

const activeDriver = (): StorageDriver => {
  const name = process.env.STORAGE_DRIVER || "local";
  const driver = drivers[name];
  if (!driver) {
    throw new Error(`Unknown STORAGE_DRIVER: "${name}" (local | r2)`);
  }
  return driver;
};

/** Загрузить файл через активный драйвер. */
export const uploadFile = (file: File): Promise<UploadedFile> =>
  activeDriver().upload(file);

/**
 * Удалить файл по URL. Определяет драйвер-владелец по URL,
 * внешние URL (например, демо-видео из seed) молча пропускает.
 */
export const deleteFileByUrl = async (url?: string | null): Promise<void> => {
  if (!url) return;

  const owner = Object.values(drivers).find((driver) => driver.owns(url));
  if (!owner) return;

  try {
    await owner.remove(url);
  } catch (error) {
    // Ошибка удаления файла не должна ломать основную операцию
    console.error("[STORAGE_DELETE]", error);
  }
};
