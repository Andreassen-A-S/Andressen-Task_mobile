import { API_URL } from "@/constants/api";
import { apiFetch } from "./apiClient";
import { Task, TaskPriority, TaskStatus, TaskUnit, UpdateTaskInput } from "@/types/task";

export interface CreateTaskInput {
  title: string;
  description?: string;
  project_id: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  start_date: string;
  created_by: string;
  assigned_users: string[];
  goal?: {
    target_quantity: number;
    unit: TaskUnit;
    current_quantity?: number;
  };
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await apiFetch(`${API_URL}/tasks`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create task");
  const data = await res.json();
  return data.data;
}

export async function getTasks(): Promise<Task[]> {
  const res = await apiFetch(`${API_URL}/tasks`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  const data = await res.json();
  return data.data;
}

export async function getTask(id: string): Promise<Task> {
  const res = await apiFetch(`${API_URL}/tasks/${id}`);
  if (!res.ok) throw new Error("Failed to fetch task");
  const data = await res.json();
  return data.data;
}

export async function updateTask(id: string, updates: Partial<UpdateTaskInput>): Promise<Task> {
  const res = await apiFetch(`${API_URL}/tasks/${id}`, {
    method: "PATCH",
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

export async function deleteTask(id: string): Promise<void> {
  const res = await apiFetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete task");
}

export async function addTaskProgress(taskId: string, payload: AddTaskProgressInput): Promise<void> {
  const res = await apiFetch(`${API_URL}/tasks/${taskId}/progress`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add task progress");
}
