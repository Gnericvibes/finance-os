import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("better-auth.session_token") || request.cookies.get("__Secure-better-auth.session_token");

  const isProtected =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/allocations") ||
    request.nextUrl.pathname.startsWith("/goals") ||
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/profile");

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/allocations/:path*",
    "/goals/:path*",
    "/settings/:path*",
    "/profile/:path*",
  ],
};
