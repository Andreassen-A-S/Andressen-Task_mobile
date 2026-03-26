import { API_URL } from "@/constants/api";
import { getAuthHeaders } from "@/helpers/helpers";
import { Project } from "@/types/project";

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_URL}/projects`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch projects");
  const data = await res.json();
  return data.data;
}
