import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isPublicAsset = pathname.includes(".") || pathname.startsWith("/_next");
  const isHomePage = pathname === "/";

  if (isPublicAsset) {
    return NextResponse.next();
  }

  const hasSessionCookie =
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__Secure-better-auth.session_token");

  // Allow guest access to Home Page
  if (isHomePage) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated and not on an auth/public page
  if (!hasSessionCookie && !isAuthPage) {
    return NextResponse.next(); // Let the next block handle session verification for accuracy
  }

  if (hasSessionCookie) {
    const baseURL = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
      baseURL,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    // If already logged in, don't allow access to login/register pages
    if (session && isAuthPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Protect all other routes except public ones
    if (!session && !isAuthPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } else if (!isAuthPage) {
    // No session cookie and not an auth page? Redirect (unless it's the home page handled above)
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
