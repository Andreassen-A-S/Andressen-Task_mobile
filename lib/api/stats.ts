import { API_URL } from "@/constants/api";
import { getAuthHeaders } from "@/helpers/helpers";
import { UserStats } from "@/types/stats";

export async function getMyStats(): Promise<UserStats> {
  const res = await fetch(`${API_URL}/stats/me`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch your stats");
  const response = await res.json();
  return response.data;
}
