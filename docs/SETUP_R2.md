# Настройка Cloudflare R2

R2 — S3-совместимое объектное хранилище Cloudflare. Бесплатный лимит: **10 GB хранилища, без платы за трафик (egress)** — идеально для видео и картинок pet-проекта.

Приложение уже умеет работать с R2: достаточно заполнить 5 переменных в `.env` и переключить `STORAGE_DRIVER=r2`. Пока переменные не заполнены, работает драйвер `local` (файлы в `./.uploads`).

## Шаг 1. Создать бакет

1. Зайдите в [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2 Object Storage** (при первом входе попросит привязать карту — в пределах free-tier списаний не будет).
2. **Create bucket** → имя, например `lms-files` → регион Automatic → **Create**.

## Шаг 2. Включить публичный доступ (раздача файлов)

Файлы (обложки курсов, видео, вложения) раздаются напрямую из бакета по публичному URL.

1. Откройте бакет → вкладка **Settings** → секция **Public access**.
2. **R2.dev subdomain** → **Allow Access** → подтвердите.
3. Скопируйте выданный URL вида `https://pub-xxxxxxxxxxxx.r2.dev` — это `R2_PUBLIC_URL`.

> Для продакшена лучше подключить кастомный домен (та же секция, **Custom Domains**) — тогда включается CDN-кэширование Cloudflare. `R2_PUBLIC_URL` в этом случае — ваш домен.

## Шаг 3. Создать API-токен (S3-ключи)

1. На странице R2 справа — **Manage R2 API Tokens** → **Create API Token**.
2. Права: **Object Read & Write**, область — только бакет `lms-files`.
3. **Create API Token** → скопируйте:
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY` (показывается один раз!)

## Шаг 4. Account ID

**Account ID** виден на главной странице R2 (или в правой панели любого домена) → `R2_ACCOUNT_ID`.

## Шаг 5. Заполнить .env и переключить драйвер

```env
STORAGE_DRIVER=r2
R2_ACCOUNT_ID=1a2b3c4d5e6f...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=lms-files
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxx.r2.dev
```

Перезапустите dev-сервер (`bun run dev`). Всё: загрузка обложек, видео глав и вложений идёт в R2, удаление сущностей чистит объекты в бакете.

## Как это устроено в коде

- `lib/storage/r2.ts` — драйвер (`@aws-sdk/client-s3`, endpoint `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`, `region: "auto"`).
- `lib/storage/index.ts` — выбор драйвера по `STORAGE_DRIVER`.
- `next.config.js` — хост из `R2_PUBLIC_URL` автоматически добавляется в `images.remotePatterns`.

Файлы, загруженные ранее локальным драйвером (`/api/files/*`), продолжают открываться и корректно удаляются: `deleteFileByUrl()` определяет драйвер-владелец по форме URL.

## Проверка

1. Войдите демо-учителем → любой курс → замените обложку.
2. URL картинки должен начинаться с вашего `R2_PUBLIC_URL`.
3. В Cloudflare Dashboard → бакет → Objects появится загруженный файл.
