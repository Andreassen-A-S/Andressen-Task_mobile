import { API_URL } from "@/constants/api";
import { apiFetch } from "./apiClient";
import { CreateCommentRequest, TaskComment } from "@/types/comment";
import { applyAttachmentUrlCache } from "./attachmentUrlCache";

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
