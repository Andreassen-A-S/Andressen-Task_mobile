import { API_URL } from "@/constants/api";
import { getAuthHeaders } from "@/helpers/helpers";
import { TaskAttachment } from "@/types/comment";

export interface PreparedAttachment {
  uploadToken: string;
  uploadUrl: string;
}

export async function prepareAttachments(
  taskId: string,
  files: { fileName: string; mimeType: string; fileSize: number }[],
): Promise<PreparedAttachment[]> {
  const res = await fetch(`${API_URL}/attachments/prepare`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ taskId, files }),
  });
  if (!res.ok) throw new Error("Failed to prepare attachments");
  const data = await res.json();
  return data.data;
}

export async function uploadToGcs(
  uploadUrl: string,
  blob: Blob,
  mimeType: string,
): Promise<void> {
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": mimeType },
  });
  if (!uploadRes.ok) throw new Error("GCS upload failed");
}

export async function getTaskImages(taskId: string): Promise<TaskAttachment[]> {
  const res = await fetch(`${API_URL}/attachments/task/${taskId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch images");
  const data = await res.json();
  return data.data;
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  const res = await fetch(`${API_URL}/attachments/${attachmentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete attachment");
}
