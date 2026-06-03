import { API_URL } from "@/constants/api";
import { apiFetch } from "./apiClient";
import { TaskAssignment, TaskAssignmentResponse } from "@/types/assignment";

export async function getUserAssignments(userId: string): Promise<TaskAssignment[]> {
  const response = await apiFetch(`${API_URL}/assignments?userId=${userId}`);
  if (!response.ok) throw new Error("Failed to fetch user assignments");
  const result: TaskAssignmentResponse = await response.json();
  return result.data;
}
