import { API_URL } from "@/constants/api";
import { apiFetch } from "./apiClient";
import { Project } from "@/types/project";

export async function getProjects(): Promise<Project[]> {
  const res = await apiFetch(`${API_URL}/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  const data = await res.json();
  return data.data;
}
