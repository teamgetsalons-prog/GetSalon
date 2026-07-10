import type { ApiResponse } from "@getsalons/shared/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function api<T = unknown>(
  path: string,
  options?: RequestInit & { json?: unknown }
): Promise<ApiResponse<T>> {
  const { json, ...init } = options ?? {};
  try {
    // Callers pass "/api/..." paths (a leftover convention from an unused
    // Next.js rewrite) - strip that prefix and hit the backend directly,
    // same as server-api.ts does for server-rendered requests.
    const cleanPath = path.replace(/^\/api(?=\/|$)/, "");
    const url = path.startsWith("http") ? path : `${API_BASE}${cleanPath}`;
    const isFormData = init.body instanceof FormData;
    const res = await fetch(url, {
      ...init,
      credentials: "include",
      // Let the browser set Content-Type (with multipart boundary) for FormData bodies.
      headers: isFormData
        ? init.headers
        : { "Content-Type": "application/json", ...init.headers },
      body: json !== undefined ? JSON.stringify(json) : init.body,
    });
    const data = (await res.json().catch(() => null)) as ApiResponse<T> | null;
    if (!data) return { success: false, message: `Request failed (${res.status}).` };
    return data;
  } catch {
    return { success: false, message: "Network error." };
  }
}