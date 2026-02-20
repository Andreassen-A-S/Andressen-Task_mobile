import { API_URL } from "@/constants/api";
import { getAuthHeaders } from "@/helpers/helpers";
import { User } from "@/types/users";

export async function getUser(userId: string): Promise<User> {
  const res = await fetch(`${API_URL}/users/${userId}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch user");
  const data = await res.json();
  return data.data;
}
