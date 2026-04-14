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

  // Detect session token (supports both secure and non-secure environments)
  const sessionToken = 
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const baseURL = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  // Helper to fetch session with high reliability
  const getSession = async () => {
    if (!sessionToken) return null;
    try {
      const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
        baseURL,
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });
      return session;
    } catch (e) {
      console.error("[MIDDLEWARE] Session fetch failed:", e);
      return null;
    }
  };

  // 1. If on auth page but already have a session, redirect to home/dashboard
  if (isAuthPage && sessionToken) {
    const session = await getSession();
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 2. Protect all routes except auth pages and the public home page
  if (!isAuthPage && !isHomePage) {
    if (!sessionToken) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    // Verify token validity for protected routes
    const session = await getSession();
    if (!session) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      
      const response = NextResponse.redirect(url);
      // Clean up invalid tokens
      response.cookies.delete("better-auth.session_token");
      response.cookies.delete("__Secure-better-auth.session_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

