import { API_URL } from "@/constants/api";
import { getAuthHeaders } from "@/helpers/helpers";
import { Task, TaskGoalType, TaskPriority, TaskStatus, TaskUnit, UpdateTaskInput } from "@/types/task";

export interface CreateTaskInput {
  title: string;
  description?: string;
  project_id: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  scheduled_date: string;
  created_by: string;
  assigned_users: string[];
  goal_type?: TaskGoalType;
  target_quantity?: number | null;
  unit?: TaskUnit;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create task");
  const data = await res.json();
  return data.data;
}

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API_URL}/tasks`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  const data = await res.json();
  return data.data;
}

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
