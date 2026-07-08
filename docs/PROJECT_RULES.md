# Project rules & conventions

## Tooling

- **Package manager: Bun** (single lockfile `bun.lock`). Do not commit `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock`.
- Format/lint: `bun run fix` (Prettier with tailwind plugin + ESLint). Run before committing.
- Verify with `bun run build` — the build runs type-checking and ESLint; it must pass.

## Code conventions

- TypeScript everywhere; path alias `@/*` from the repo root.
- File names: kebab-case (`course-enroll-button.tsx`). Route-private components live in `_components/` next to their route.
- UI primitives come from `components/ui` (shadcn/ui). Compose them; don't hand-roll buttons/inputs.
- Icons: `lucide-react`.
- Client components declare `"use client"` and stay as leaf-level as possible; pages/layouts stay Server Components.
- Toasts: `react-hot-toast` (`toast.success` / `toast.error`).

## Auth rules

- Server code gets the user via `const { userId } = await auth()` from `@/lib/session` — never import `@/lib/auth` directly in pages/handlers (it's the Better Auth instance, used by the auth route and helpers only).
- Client code uses `useSession` from `@/lib/auth-client`.
- Every mutation handler must check `userId` **and** resource ownership (`where: { id, userId }`).
- New protected pages are covered by `middleware.ts` automatically; public routes must be added to its allow-list explicitly.

## Data access rules

- Reads: directly in Server Components (or `actions/get-*.ts` helpers for reusable queries).
- Writes: only through `app/api/**` route handlers; client calls them with axios and then `router.refresh()`.
- Prisma client singleton: `db` from `@/lib/db`.
- Schema changes: edit `prisma/schema.prisma` → `bun run db:push` (no migration files in this project) → restart TS server if types lag.

## Files & media

- All uploads go through `POST /api/upload` with a `kind` (`image` | `video` | `attachment`) — never call a storage SDK from the client.
- Deleting an entity that references a file must call `deleteFileByUrl()` from `@/lib/storage`.
- New storage providers: implement `StorageDriver` in `lib/storage/`, register it in `lib/storage/index.ts`, document the env vars in `.env.example`.

## UX rules

- Any new data-heavy route gets a `loading.tsx` (reuse `components/skeletons.tsx`).
- Any button that triggers a request shows a pending state (spinner or disabled).
- Errors from mutations surface as `toast.error`, not silent console logs.

## Env & secrets

- `.env` is gitignored; every new variable must be mirrored (empty) in `.env.example` with a comment.
- Demo credentials live in `lib/demo.ts` and are used by both the seeder and the sign-in page — change them in one place only.
