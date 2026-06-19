import { NextRequest, NextResponse } from "next/server";
import { decodeToken } from "./utils/jwt";
import { buildAccessDeniedRedirectUrl } from "./lib/access-denied-notice";

function deniedRedirect(request: NextRequest) {
  const target = buildAccessDeniedRedirectUrl({
    origin: request.nextUrl.origin,
    forbiddenPathname: request.nextUrl.pathname,
    referer: request.headers.get("referer"),
  });
  return NextResponse.redirect(target);
}

function loginRedirect(request: NextRequest) {
  const login = new URL("/auth/login", request.nextUrl.origin);
  login.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export default function proxy(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/admin", "/profile", "/messages", "/notifications"];
  const authRoutes = ["/auth/login", "/auth/sign-up"];

  const payload = token ? decodeToken(token) : null;

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return loginRedirect(request);
    }

    if (
      !payload ||
      !payload.roles?.some((r) => ["ADMIN", "MODERATOR", "SUPPORT"].includes(r))
    ) {
      return deniedRedirect(request);
    }
  }

  if (pathname.startsWith("/employer")) {
    if (!token) {
      return loginRedirect(request);
    }
    if (!payload?.roles?.includes("EMPLOYER")) {
      return deniedRedirect(request);
    }
  }

  const candidateRoutes = [
    "/resume",
    "/resumes",
    "/saved-jobs",
    "/followed-companies",
    "/applied-jobs",
    "/cv/my",
    "/cv/editor",
    "/jobs/recommended",
    "/profile/recommendations",
  ];
  if (candidateRoutes.some((r) => pathname.startsWith(r))) {
    if (!token) {
      return loginRedirect(request);
    }
    if (!payload?.roles?.includes("CANDIDATE")) {
      return deniedRedirect(request);
    }
  }

  if (pathname.startsWith("/messages")) {
    if (!token) {
      return loginRedirect(request);
    }
    if (!payload?.roles?.some((r) => ["EMPLOYER", "CANDIDATE"].includes(r))) {
      return deniedRedirect(request);
    }
  }

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtected && !token) {
    return loginRedirect(request);
  }

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
