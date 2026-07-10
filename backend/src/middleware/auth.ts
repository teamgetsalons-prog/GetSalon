import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getEnv } from "../config.js";

export interface AuthUser {
  id: string;
  role: string;
  salonId?: string;
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

export function signToken(user: { id: string; role: string; salonId?: string; name?: string; email?: string }): string {
  return jwt.sign(user, getEnv().AUTH_SECRET, { expiresIn: "30d" });
}
