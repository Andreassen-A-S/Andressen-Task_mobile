import { API_URL } from "@/constants/api";
import { getAuthHeaders } from "@/helpers/helpers";
import { Task, TaskUnit, UpdateTaskInput } from "@/types/task";

export async function getTask(id: string): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch task");
  const data = await res.json();
  return data.data;
}

export async function updateTask(id: string, updates: Partial<UpdateTaskInput>): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update task");
  const data = await res.json();
  return data.data;
}

export interface AddTaskProgressInput {
  quantity_done: number;
  unit?: TaskUnit;
  note?: string;
}

export async function addTaskProgress(taskId: string, payload: AddTaskProgressInput): Promise<void> {
  const res = await fetch(`${API_URL}/tasks/${taskId}/progress`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add task progress");
}
