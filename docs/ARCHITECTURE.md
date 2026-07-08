# Architecture

## Overview

The app is a classic Next.js App Router monolith: React Server Components read from the database directly, mutations go through REST-ish route handlers under `app/api/*`, and client components call them with axios + `router.refresh()`.

```
Browser ── RSC (pages, direct Prisma reads)
   │
   └── axios ──> app/api/* route handlers ──> Prisma ──> PostgreSQL
                      │
                      ├── lib/session.ts  (Better Auth)
                      ├── lib/storage/*   (file storage drivers)
                      └── lib/stripe.ts   (payments)
```

## Directory layout

```
app/
  (auth)/                 sign-in / sign-up pages (public)
  (dashboard)/            main app shell: sidebar + navbar
    (routes)/
      (root)/             "/" — course catalog with search & categories
      dashboard/          student dashboard (progress overview)
      teacher/            teacher mode: course CRUD, analytics
  (course)/               course player layout (chapter sidebar)
  api/
    auth/[...all]/        Better Auth handler (sign-in/up/out, session)
    courses/...           course/chapter/attachment/progress mutations
    upload/               file upload endpoint (multipart)
    files/[fileName]/     serves local-driver files (Range support)
    webhook/              Stripe checkout.session.completed
actions/                  server-side query helpers (get-courses, get-chapter, ...)
components/               shared UI (shadcn/ui in components/ui)
lib/                      auth, db, storage, stripe, utils
prisma/schema.prisma      data model
scripts/seed.ts           demo data seeder
```

Route groups `(auth)`, `(dashboard)`, `(course)` exist only to give each area its own layout.

## Authentication — Better Auth

- Instance: `lib/auth.ts` (Prisma adapter, email/password, `nextCookies` plugin).
- Server helper: `lib/session.ts` exports `auth()` returning `{ userId }` — same shape the old Clerk API had, which keeps call sites trivial: `const { userId } = await auth()`.
- Client: `lib/auth-client.ts` (`useSession`, `signIn`, `signUp`, `signOut`).
- Route handler: `app/api/auth/[...all]/route.ts`.
- `middleware.ts` does an **optimistic** check — it only verifies the session cookie exists (no DB hit) and redirects anonymous users to `/sign-in`. Real session validation happens server-side in layouts/handlers.
- Users have a `role` field (`student` | `teacher`) set by the seeder; it is informational. Access model is "Udemy-style": any signed-in user may create courses, and every mutation is scoped by `userId` ownership checks in the route handlers.

## Data model (Prisma)

Auth tables (`User`, `Session`, `Account`, `Verification`) are owned by Better Auth.

Domain:

- `Course` (owner `userId`, price, publish flag) → `Chapter[]`, `Attachment[]`, `Purchase[]`, `Category?`
- `Chapter` (position, `isFree`, `videoUrl`, publish flag) → `UserProgress[]`
- `Purchase` (`@@unique([userId, courseId])`) — created by Stripe webhook or instantly for free courses
- `UserProgress` (`@@unique([userId, chapterId])`) — chapter completion
- `StripeCustomer` — maps `userId` to a Stripe customer id

Note: `Course.userId`, `Purchase.userId`, `UserProgress.userId` reference `User.id` logically but without FK constraints — historical decision, kept to avoid coupling domain tables to the auth tables.

## File storage

`lib/storage/` is a driver-based abstraction:

- `types.ts` — `StorageDriver { upload, remove, owns }`
- `local.ts` — default; writes to `./.uploads`, files served by `app/api/files/[fileName]` (streaming, HTTP Range → video seeking, path-traversal protection)
- `r2.ts` — Cloudflare R2 via `@aws-sdk/client-s3` (S3-compatible API, endpoint `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`); enabled with `STORAGE_DRIVER=r2`, serves files from the bucket's public URL (`R2_PUBLIC_URL`). Setup guide: `docs/SETUP_R2.md`
- `index.ts` — `uploadFile()` uses the active driver; `deleteFileByUrl()` finds the owning driver by URL and skips external URLs (e.g. seeded demo videos on Google's CDN)

Upload flow: `components/file-upload.tsx` (react-dropzone, progress bar) → `POST /api/upload` (auth + per-kind size/MIME validation: image 4MB, video 512MB, attachment 32MB) → driver.

Video playback is plain progressive MP4 via `react-player` — no transcoding service (Mux was removed). R2 serves video with Range support out of the box, so seeking works; with a custom domain attached the bucket is also fronted by Cloudflare CDN.

## Payments

- `POST /api/courses/[courseId]/checkout`:
  - free course (`price` null/0) → creates `Purchase` immediately;
  - paid → Stripe Checkout session (test mode), customer cached in `StripeCustomer`.
- `POST /api/webhook` — verifies signature, on `checkout.session.completed` creates the `Purchase`. Locally requires `stripe listen --forward-to localhost:3000/api/webhook`.

## Performance notes

- Progress calculation is batched: `getProgressMap()` (actions/get-progress.ts) resolves completion for any number of courses with a single `userProgress` query — the catalog and dashboard have no N+1. The course player layout computes progress from chapters it already loaded (`computeProgress`).
- Independent queries run in parallel (`Promise.all`) — see `actions/get-chapter.ts`.
- Catalog search is case-insensitive (`mode: "insensitive"`).
- Hot query paths are covered by indexes: `Course.userId` (ownership checks, teacher lists), `Course.categoryId`, plus the unique composites on `Purchase` and `UserProgress` which double as `userId` prefix indexes.

## Loading UX

Every data-heavy route segment has a `loading.tsx` (skeletons in `components/skeletons.tsx`), so slow DB responses show instant feedback during navigation. Mutating buttons keep their own `isLoading` state; forms disable inputs while submitting.

## Known trade-offs

- Mutations are route handlers + axios (tutorial-era style), not Server Actions. Consistent and works; migrating to Server Actions would be a separate refactor.
- `Course.description` stores Quill HTML; rendered via `react-quill` read-only preview.
- Local storage driver is not suitable for serverless deployment (files live on the instance disk) — use the R2 driver there.
