import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getEnv } from "../config.js";

export interface AuthUser {
  id: string;
  role: string;
  salonId?: string;
  // Optional: may be present from older tokens but not signed into new ones
  name?: string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.getsalons_token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ success: false, message: "You must be logged in." });
    return;
  }
  try {
    req.user = jwt.verify(token, getEnv().AUTH_SECRET) as AuthUser;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.getsalons_token || req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    try { req.user = jwt.verify(token, getEnv().AUTH_SECRET) as AuthUser; } catch {}
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) { res.status(401).json({ success: false, message: "Not authenticated." }); return; }
    if (!roles.includes(req.user.role)) { res.status(403).json({ success: false, message: "No permission." }); return; }
    next();
  };
}

export function signToken(user: { id: string; role: string; salonId?: string }): string {
  return jwt.sign({ id: user.id, role: user.role, salonId: user.salonId }, getEnv().AUTH_SECRET, { expiresIn: "7d" });
}

// All browser traffic reaches us through the frontend's /api proxy on the
// SAME domain the user is visiting, so this cookie is always first-party
// and SameSite=Lax is both sufficient and safer (CSRF protection, and
// unlike cross-site SameSite=None it isn't blocked by Safari/iOS).
// Shared here because any route that re-issues the session (login, salon
// creation) must use identical attributes or clearCookie stops matching.
export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
