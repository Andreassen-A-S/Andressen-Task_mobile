import { API_URL } from "@/constants/api";
import { getAuthHeaders } from "@/helpers/helpers";
import { User } from "@/types/users";

export async function getUser(userId: string): Promise<User> {
  const res = await fetch(`${API_URL}/users/${userId}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch user");
  const data = await res.json();
  return data.data;
}

export async function registerPushToken(pushToken: string | null): Promise<void> {
  await fetch(`${API_URL}/users/push-token`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ push_token: pushToken }),
  });
}
