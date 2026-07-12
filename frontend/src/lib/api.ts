import type { ApiResponse } from "@getsalons/shared/types";

export async function api<T = unknown>(
  path: string,
  options?: RequestInit & { json?: unknown }
): Promise<ApiResponse<T>> {
  const { json, ...init } = options ?? {};
  try {
    // "/api/..." paths stay on our own origin - next.config.ts proxies them
    // to the backend. Calling the backend directly from the browser is NOT
    // supported: the session cookie would be third-party there, which
    // Safari/iOS reject outright, and it reintroduces CORS + env-var
    // coupling that has broken production before.
    const isFormData = init.body instanceof FormData;
    const res = await fetch(path, {
      cache: "no-store",
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
