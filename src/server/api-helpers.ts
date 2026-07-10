import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/server/auth";
import type { ApiResponse, UserRole } from "@/types";

/** Typed error that carries an HTTP status through service layers */
export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    status = 400,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function ok<T>(
  data: T,
  extra?: Partial<ApiResponse<T>>,
  status = 200
): NextResponse {
  return NextResponse.json(
    { success: true, data, ...extra } satisfies ApiResponse<T>,
    { status }
  );
}

export function fail(
  message: string,
  status = 400,
  errors?: Record<string, string[]>
): NextResponse {
  return NextResponse.json(
    { success: false, message, errors } satisfies ApiResponse,
    { status }
  );
}

export function zodErrors(error: ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

/** Central error → response mapping for all API routes */
export function handleApiError(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return fail(err.message, err.status, err.errors);
  }
  if (err instanceof ZodError) {
    return fail("Validation failed", 422, zodErrors(err));
  }
  // Mongo duplicate key (race conditions, e.g. double booking backstop)
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: number }).code === 11000
  ) {
    return fail("This record already exists or the slot was just taken.", 409);
  }
  console.error("[api] unhandled error:", err);
  return fail("Something went wrong. Please try again.", 500);
}

/** Session user or 401 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError("You must be logged in.", 401);
  }
  return session.user;
}

/** Session user with one of the given roles, or 403 */
export async function requireRole(...roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new ApiError("You don't have permission to do this.", 403);
  }
  return user;
}

// ── Rate limiting ───────────────────────────────────────────
// In-memory sliding window. Per server instance — for multi-instance
// production deployments swap with Upstash Redis (@upstash/ratelimit).
const buckets = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): void {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    throw new ApiError("Too many requests. Please slow down.", 429);
  }
  hits.push(now);
  buckets.set(key, hits);

  // Opportunistic cleanup so the map doesn't grow unbounded
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}
