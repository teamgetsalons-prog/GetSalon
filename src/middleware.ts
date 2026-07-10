import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/server/auth/auth.config";
import type { UserRole } from "@/types";

const { auth } = NextAuth(authConfig);

function roleHome(role?: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "owner":
    case "staff":
      return "/salon-dashboard";
    default:
      return "/dashboard";
  }
}

export default auth((req) => {
  const { nextUrl } = req;
  const user = req.auth?.user;
  const isLoggedIn = !!user;
  const path = nextUrl.pathname;

  const isAuthPage = path === "/login" || path === "/register";

  // Logged-in users don't need the auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL(roleHome(user?.role), nextUrl));
  }
  if (isAuthPage) return NextResponse.next();

  // Everything matched below requires a session
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", path + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Role gates
  if (path.startsWith("/admin") && user?.role !== "admin") {
    return NextResponse.redirect(new URL(roleHome(user?.role), nextUrl));
  }
  if (
    path.startsWith("/salon-dashboard") &&
    user?.role !== "owner" &&
    user?.role !== "staff" &&
    user?.role !== "admin"
  ) {
    return NextResponse.redirect(new URL(roleHome(user?.role), nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/salon-dashboard/:path*",
    "/admin/:path*",
    "/book/:path*",
    "/login",
    "/register",
  ],
};
