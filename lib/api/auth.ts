import { API_URL } from "@/constants/api";
import { LoginRequest, LoginResponse } from "@/types/auth";
import { normalizeUser } from "@/lib/api/userNormalizer";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const error = await res.json();
    const err = new Error(error.error || "Failed to login") as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  const response = await res.json();
  return {
    ...response.data,
    user: normalizeUser(response.data.user),
  };
}

export async function refreshToken(raw: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: raw }),
  });
  if (!res.ok) throw new Error("Refresh failed");
  const response = await res.json();
  return {
    ...response.data,
    user: normalizeUser(response.data.user),
  };
}
