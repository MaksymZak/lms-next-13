import "server-only";

import { headers } from "next/headers";

import { auth as betterAuth } from "@/lib/auth";

/**
 * Серверный хелпер с сигнатурой в стиле Clerk: `const { userId } = await auth()`.
 * Использовать в серверных компонентах и route handlers.
 */
export const auth = async (): Promise<{ userId: string | null }> => {
  const session = await betterAuth.api.getSession({ headers: headers() });
  return { userId: session?.user.id ?? null };
};

/** Полный пользователь текущей сессии (или null). */
export const currentUser = async () => {
  const session = await betterAuth.api.getSession({ headers: headers() });
  return session?.user ?? null;
};
