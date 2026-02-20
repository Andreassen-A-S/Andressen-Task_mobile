import { API_URL } from "@/constants/api";
import { LoginRequest, LoginResponse, VerifyResponse } from "@/types/auth";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to login");
  }
  const response = await res.json();
  return response.data;
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
    throw new Error(error.message || "Failed to verify token");
  }
  const { data } = await res.json();
  return {
    user: {
      user_id: data.user_id,
      email: data.email,
      role: data.role,
      name: data.name,
      position: data.position ?? "",
    },
  };
}
