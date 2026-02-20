import { API_URL } from "@/constants/api";
import { getAuthHeaders } from "@/helpers/helpers";
import { TaskAssignment, TaskAssignmentResponse } from "@/types/assignment";

export async function getUserAssignments(userId: string): Promise<TaskAssignment[]> {
  const response = await fetch(`${API_URL}/assignments?userId=${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch user assignments");
  const result: TaskAssignmentResponse = await response.json();
  return result.data;
}
