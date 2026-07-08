# LMS — Learning Management System

A full-stack Learning Management System built with **Next.js 14 (App Router)**. Teachers create courses with rich-text descriptions, video chapters and attachments; students browse the catalog, enroll (free or via Stripe), watch videos and track progress.

## Features

**For students**

- Course catalog with search and category filters
- Free enrollment and paid checkout (Stripe, test mode)
- Video player with automatic progress tracking and "next chapter" flow
- Personal dashboard: courses in progress / completed
- Free preview chapters on paid courses

**For teachers**

- Course builder: title, rich-text description (Quill), cover image, price, category
- Chapter editor with drag-and-drop reordering, free/paid access per chapter
- Video and attachment uploads with progress bar
- Publish/unpublish workflow with completeness validation
- Analytics: revenue and sales charts per course

## Tech stack

| Layer     | Technology                                              |
| --------- | ------------------------------------------------------- |
| Framework | Next.js 14 (App Router, Server Components), React 18    |
| Language  | TypeScript                                              |
| Auth      | [Better Auth](https://better-auth.com) (email/password) |
| Database  | PostgreSQL + Prisma ORM                                 |
| Storage   | Pluggable: local disk (default) or Cloudflare R2        |
| Payments  | Stripe Checkout + webhook                               |
| UI        | Tailwind CSS, shadcn/ui (Radix), lucide-react           |
| Runtime   | Bun                                                     |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details and [docs/PROJECT_RULES.md](docs/PROJECT_RULES.md) for project conventions.

## Getting started

Prerequisites: [Bun](https://bun.sh), Docker (for PostgreSQL).

```bash
# 1. Install dependencies
bun install

# 2. Environment
cp .env.example .env   # then fill in BETTER_AUTH_SECRET (openssl rand -base64 32)

# 3. Start PostgreSQL (docker container lms_postgres)
bun run db:start
docker exec lms_postgres psql -U postgres -c "CREATE DATABASE lms;"

# 4. Create schema and seed demo data
bun run db:push
bun run db:seed

# 5. Run
bun run dev
```

Open http://localhost:3000 — you will be redirected to the sign-in page.

### Demo accounts

| Role    | Email              | Password    | What's inside                                 |
| ------- | ------------------ | ----------- | --------------------------------------------- |
| Teacher | `teacher@demo.lms` | `demo12345` | 3 published courses + 1 draft, analytics data |
| Student | `student@demo.lms` | `demo12345` | Purchased courses, chapter progress           |

Both are available as one-click buttons on the sign-in page. You can also register a fresh account — every user can both learn and create courses ("teacher mode").

### Payments (optional)

Paid checkout uses Stripe in test mode. To complete a purchase locally you need the webhook:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhook
# put the printed whsec_... into STRIPE_WEBHOOK_SECRET
```

Test card: `4242 4242 4242 4242`, any future date / CVC. Free courses (price = 0) enroll instantly without Stripe.

### File storage

By default files (course covers, chapter videos, attachments) are stored on local disk in `./.uploads` and served through `/api/files/*` with HTTP Range support (video seeking works). For cloud storage the project uses **Cloudflare R2** (10 GB free, zero egress fees):

```env
STORAGE_DRIVER=r2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=lms-files
R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
```

Step-by-step setup: [docs/SETUP_R2.md](docs/SETUP_R2.md). The storage layer is a small abstraction (`lib/storage/`), so adding another provider only requires implementing 3 methods.

## Scripts

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `bun run dev`       | Dev server                         |
| `bun run build`     | Production build                   |
| `bun run db:start`  | Start PostgreSQL in Docker         |
| `bun run db:push`   | Sync Prisma schema to the database |
| `bun run db:seed`   | Seed categories + demo data        |
| `bun run db:studio` | Prisma Studio (DB browser)         |
| `bun run fix`       | Prettier + ESLint autofix          |
