import { API_URL } from "@/constants/api";
import { getAuthHeaders } from "@/helpers/helpers";
import { TaskAttachment } from "@/types/comment";

export interface UploadUrlResponse {
  uploadUrl: string;
  gcsPath: string;
  publicUrl: string;
}

export async function getUploadUrl(
  task_id: string,
  file_name: string,
  mime_type: string,
): Promise<UploadUrlResponse> {
  const res = await fetch(`${API_URL}/attachments/upload-url`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ task_id, file_name, mime_type }),
  });
  if (!res.ok) throw new Error("Failed to get upload URL");
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
