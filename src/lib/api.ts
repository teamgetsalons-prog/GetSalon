import type { ApiResponse } from "@/types";

/**
 * Thin client-side fetch wrapper for our API routes.
 * Always resolves to an ApiResponse — network failures become
 * { success: false } so components can render errors uniformly.
 */
export async function api<T = unknown>(
  path: string,
  options?: RequestInit & { json?: unknown }
): Promise<ApiResponse<T>> {
  const { json, ...init } = options ?? {};

  try {
    const res = await fetch(path, {
      ...init,
      headers: {
        ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
      body: json !== undefined ? JSON.stringify(json) : init.body,
    });

    const data = (await res.json().catch(() => null)) as ApiResponse<T> | null;
    if (!data) {
      return { success: false, message: `Request failed (${res.status}).` };
    }
    return data;
  } catch {
    return {
      success: false,
      message: "Network error — check your connection and try again.",
    };
  }
}
