import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isPublicAsset = pathname.includes(".") || pathname.startsWith("/_next") || pathname.startsWith("/api");
  const isHomePage = pathname === "/";

  if (isPublicAsset) {
    return NextResponse.next();
  }

  // Detect session token (trust cookie existence for Edge fast-pathing)
  // Deep validation occurs in the layout/RSC boundary securely
  const sessionToken = 
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  // 1. If on auth page but already have a session, fast-redirect to dashboard
  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Protect all routes except auth pages and the public home page
  if (!isAuthPage && !isHomePage) {
    if (!sessionToken) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

