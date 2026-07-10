import { api } from "./api";
import type { ApiResponse } from "@getsalons/shared/types";

interface SessionUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

export async function login(email: string, password: string) {
  return api<{ user: SessionUser; token: string }>("/api/auth/login", {
    method: "POST",
    json: { email, password },
  });
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) {
  return api<{ user: SessionUser; token: string }>("/api/auth/register", {
    method: "POST",
    json: data,
  });
}

export async function logout() {
  return api("/api/auth/logout", { method: "POST" });
}

export async function getSession() {
  return api<{ user: SessionUser }>("/api/auth/session");
}