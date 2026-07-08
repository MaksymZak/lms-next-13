import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Оптимистичная проверка: смотрим только наличие session cookie (без запроса к БД).
// Реальная валидация сессии происходит на сервере в layouts/pages/route handlers.
const publicRoutes = ["/sign-in", "/sign-up"];
const publicApiPrefixes = ["/api/auth", "/api/webhook"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    publicRoutes.includes(pathname) ||
    publicApiPrefixes.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    if (pathname.startsWith("/api")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/api(.*)"],
};
