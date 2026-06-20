import { API_URL } from "@/constants/api";
import { apiFetch } from "./apiClient";
import { CreateCommentRequest, TaskComment } from "@/types/comment";
import { applyAttachmentUrlCache } from "./attachmentUrlCache";

export interface TaskEvent {
  event_id: string;
  type: string;
  actor_id: string | null;
  comment_id?: string | null;
  before_json?: unknown;
  after_json?: unknown;
  created_at: string;
  comment?: Record<string, unknown> | null;
  actor?: { user_id: string; name?: string | null; email: string; profile_picture_url?: string | null } | null;
}

export async function getTaskEvents(taskId: string): Promise<TaskEvent[]> {
  const response = await apiFetch(`${API_URL}/task-events/${taskId}`);
  if (!response.ok) throw new Error("Failed to fetch task events");
  const result = await response.json();
  return result.data ?? result;
}

export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const response = await apiFetch(`${API_URL}/comments/task/${taskId}`);
  if (!response.ok) throw new Error("Failed to fetch comments");
  const result = await response.json();
  return (result.data as TaskComment[]).map((c) => ({
    ...c,
    attachments: applyAttachmentUrlCache(c.attachments ?? []),
  }));
}

export async function createComment(taskId: string, data: CreateCommentRequest): Promise<TaskComment> {
  const response = await apiFetch(`${API_URL}/comments/task/${taskId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create comment");
  const result = await response.json();
  // Ensure attachments array is always present
  return { ...result.data, attachments: result.data.attachments ?? [] };
}

export async function deleteComment(commentId: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/comments/${commentId}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete comment");
}
