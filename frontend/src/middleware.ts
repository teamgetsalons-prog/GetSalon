import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Must match the backend's AUTH_SECRET exactly, or every token fails
// verification here and every visitor gets treated as logged out.
const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET ?? "");

function roleHome(role?: string): string {
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

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const token = req.cookies.get("getsalons_token")?.value;

  let user: { role?: string } | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = payload as { role?: string };
    } catch {
      // Invalid token — treat as unauthenticated
    }
  }

  const isLoggedIn = !!user;
  const isAuthPage = path === "/login" || path === "/register";

  // Logged-in users don't need auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL(roleHome(user?.role), nextUrl));
  }
  if (isAuthPage) return NextResponse.next();

  // Everything below requires authentication
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
}

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