import { API_URL } from "@/constants/api";
import { LoginRequest, LoginResponse, VerifyResponse } from "@/types/auth";
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

export async function verifyToken(token: string): Promise<VerifyResponse> {
  const res = await fetch(`${API_URL}/auth/verify`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to verify token");
  }
  const { data } = await res.json();
  return {
    user: normalizeUser({
      user_id: data.user_id,
      email: data.email,
      role: data.role,
      name: data.name,
      position_id: data.position_id,
      position: data.position,
      profile_picture_url: data.profile_picture_url,
      organization_id: data.organization_id,
      organization: data.organization,
    }),
  };
}
