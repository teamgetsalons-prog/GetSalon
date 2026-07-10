import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function ok<T>(res: Response, data: T, extra?: Record<string, unknown>, status = 200) {
  return res.status(status).json({ success: true, data, ...extra });
}

export function fail(res: Response, message: string, status = 400, errors?: Record<string, string[]>) {
  return res.status(status).json({ success: false, message, errors });
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) return fail(res, err.message, err.status);
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".") || "_";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return fail(res, "Validation failed", 422, fieldErrors);
  }
  console.error("[api] unhandled:", err);
  return fail(res, "Something went wrong.", 500);
}
