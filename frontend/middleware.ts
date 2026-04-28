import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicExact = new Set(["/login", "/signup"]);
const protectedPrefixes = ["/dashboard", "/analytics", "/settings", "/team", "/workspace"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isPublic = publicExact.has(pathname);
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublic && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/team/:path*",
    "/workspace/:path*",
  ],
};
