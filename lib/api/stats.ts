import { API_URL } from "@/constants/api";
import { apiFetch } from "./apiClient";
import { UserStats } from "@/types/stats";

export async function getMyStats(): Promise<UserStats> {
  const res = await apiFetch(`${API_URL}/stats/me`);
  if (!res.ok) throw new Error("Failed to fetch your stats");
  const response = await res.json();
  return response.data;
}
