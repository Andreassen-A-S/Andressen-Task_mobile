import { API_URL } from "@/constants/api";
import { getAuthHeaders } from "@/helpers/helpers";
import { TaskAttachment } from "@/types/comment";
import { applyAttachmentUrlCache, bustAttachmentUrl } from "./attachmentUrlCache";

export interface PreparedAttachment {
  upload_token: string;
  upload_url: string;
}

export async function prepareAttachments(
  task_id: string,
  files: { file_name: string; mime_type: string; file_size: number }[],
): Promise<PreparedAttachment[]> {
  const res = await fetch(`${API_URL}/attachments/prepare`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ task_id, files }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to prepare attachments");
  }
  const data = await res.json();
  return data.data;
}

export async function uploadToGcs(
  upload_url: string,
  blob: Blob,
  mime_type: string,
): Promise<void> {
  const uploadRes = await fetch(upload_url, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": mime_type },
  });
  if (!uploadRes.ok) throw new Error(`GCS upload failed (${uploadRes.status})`);
}

export async function getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
  const res = await fetch(`${API_URL}/attachments/task/${taskId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch attachments (${res.status})`);
  const data = await res.json();
  return applyAttachmentUrlCache(data.data);
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  const res = await fetch(`${API_URL}/attachments/${attachmentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete attachment");
  bustAttachmentUrl(attachmentId);
}
