import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";

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

// The zod schemas live in shared/ which has its own node_modules, so a
// ZodError thrown by them is a DIFFERENT class instance than backend's
// zod - a plain instanceof check silently misses it and every validation
// failure would fall through to a 500. Match by shape as well.
function isZodError(err: unknown): err is ZodError {
  return (
    err instanceof ZodError ||
    (err instanceof Error && err.name === "ZodError" && Array.isArray((err as ZodError).issues))
  );
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) return fail(res, err.message, err.status);
  if (isZodError(err)) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".") || "_";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return fail(res, "Validation failed", 422, fieldErrors);
  }
  // Zod schemas should catch bad input first, but any gap between a zod
  // schema and the stricter Mongoose model must surface as a clean
  // validation response, not a 500.
  if (err instanceof mongoose.Error.ValidationError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [path, e] of Object.entries(err.errors)) {
      (fieldErrors[path] ??= []).push(e.message);
    }
    return fail(res, "Validation failed", 422, fieldErrors);
  }
  // Malformed ObjectIds in URLs (e.g. /salons/undefined) are bad requests,
  // not server faults.
  if (err instanceof mongoose.Error.CastError) {
    return fail(res, "Invalid id.", 400);
  }
  // Log the stack string, not the raw object - inspecting foreign error
  // objects (e.g. cross-package zod) has crashed console.error before,
  // which took down the response with it.
  console.error("[api] unhandled:", err instanceof Error ? err.stack ?? err.message : err);
  return fail(res, "Something went wrong.", 500);
}
