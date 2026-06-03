import { API_URL } from "@/constants/api";
import { apiFetch } from "./apiClient";
import { User } from "@/types/users";
import { normalizeUser } from "@/lib/api/userNormalizer";

export async function getUsers(): Promise<User[]> {
  const res = await apiFetch(`${API_URL}/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  const data = await res.json();
  return data.data.map(normalizeUser);
}

export async function getUser(userId: string): Promise<User> {
  const res = await apiFetch(`${API_URL}/users/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  const data = await res.json();
  return normalizeUser(data.data);
}

export async function registerPushToken(pushToken: string | null): Promise<void> {
  const res = await apiFetch(`${API_URL}/users/push-token`, {
    method: "POST",
    body: JSON.stringify({ push_token: pushToken }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to register push token");
  }
}
