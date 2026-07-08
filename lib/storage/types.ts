/* eslint-disable no-unused-vars */
export interface UploadedFile {
  url: string;
  name: string;
}

export interface StorageDriver {
  /** Загрузить файл, вернуть публичный URL. */
  upload(file: File): Promise<UploadedFile>;
  /** Удалить файл по URL. Не бросает, если файла уже нет. */
  remove(url: string): Promise<void>;
  /** Принадлежит ли URL этому драйверу (чтобы не трогать чужие/внешние URL). */
  owns(url: string): boolean;
}
