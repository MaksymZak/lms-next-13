# CLAUDE.md — контекст проекта

LMS (учебная платформа) на Next.js 14 App Router. Портфолио-проект, восстановлен из старого туториального кода (Clerk/Mux/PlanetScale выпилены). Подробности: `docs/ARCHITECTURE.md`, правила кода: `docs/PROJECT_RULES.md` — прочитай оба перед изменениями.

## Стек

Next.js 14 (App Router) + React 18 + TypeScript · Better Auth (email/password) · Prisma + PostgreSQL (docker, локально) · Tailwind + shadcn/ui · Stripe (test mode) · Bun.

## Команды

```bash
bun run dev          # dev-сервер (нужен запущенный postgres)
bun run db:start     # docker start lms_postgres
bun run db:push      # prisma db push
bun run db:seed      # категории + демо-аккаунты (пересоздаёт демо-данные)
bun run build        # прод-сборка = типы + eslint, должна проходить
bun run fix          # prettier + eslint --fix
```

БД: `postgresql://postgres:123456@localhost:5432/lms` (контейнер `lms_postgres`). Если контейнера нет — `bun run db:start` создаст, затем `docker exec lms_postgres psql -U postgres -c "CREATE DATABASE lms;"`.

## Ключевые точки

- Сессия на сервере: `const { userId } = await auth()` из `@/lib/session` (шейп как у Clerk). На клиенте: `useSession` из `@/lib/auth-client`. Инстанс Better Auth: `lib/auth.ts` (не импортировать в страницы).
- `middleware.ts` — оптимистичная проверка cookie, всё приватно кроме /sign-in, /sign-up, /api/auth, /api/webhook.
- Файлы: абстракция `lib/storage/` (драйверы local | r2, env `STORAGE_DRIVER`). Загрузка только через `POST /api/upload`. Локальные файлы в `./.uploads`, раздаются через `/api/files/[fileName]` (Range поддержан). R2 = Cloudflare R2 через @aws-sdk/client-s3, настройка в docs/SETUP_R2.md, публичная раздача через `R2_PUBLIC_URL`.
- Мутации — route handlers в `app/api/**` + axios + `router.refresh()` (не Server Actions — осознанно).
- Демо-аккаунты: `lib/demo.ts` (teacher@demo.lms / student@demo.lms, пароль demo12345), сидятся в `scripts/seed.ts`.
- Оплата: бесплатный курс (price 0/null) — мгновенный Purchase; платный — Stripe Checkout, Purchase создаёт webhook (локально нужен `stripe listen --forward-to localhost:3000/api/webhook`).
- Модель доступа Udemy-style: любой залогиненный может создавать свои курсы; все мутации проверяют владение `where: { id, userId }`.

## Гайдлайны

- Новые data-heavy роуты → `loading.tsx` (скелетоны в `components/skeletons.tsx`).
- Новые env-переменные → зеркалить в `.env.example`.
- Перед завершением работы: `bun run build` должен быть зелёным.
