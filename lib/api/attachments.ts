import { API_URL } from "@/constants/api";
import { apiFetch } from "./apiClient";
import { TaskAttachment } from "@/types/comment";
import { applyAttachmentUrlCache, bustAttachmentUrl } from "./attachmentUrlCache";
import { File as FSFile, UploadType } from "expo-file-system";

export interface PreparedAttachment {
  upload_token: string;
  upload_url: string;
}

export async function prepareAttachments(
  task_id: string,
  files: { file_name: string; mime_type: string; file_size: number }[],
): Promise<PreparedAttachment[]> {
  const res = await apiFetch(`${API_URL}/attachments/prepare`, {
    method: "POST",
    body: JSON.stringify({ task_id, files }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error ?? "Failed to prepare attachments");
  }
  const data = await res.json();
  return data.data;
}

export async function uploadToGcs(
  upload_url: string,
  fileUri: string,
  mime_type: string,
): Promise<void> {
  const file = new FSFile(fileUri);
  const result = await file.upload(upload_url, {
    httpMethod: "PUT",
    uploadType: UploadType.BINARY_CONTENT,
    headers: { "Content-Type": mime_type },
  });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`GCS upload failed (${result.status})`);
  }
}

export async function getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
  const res = await apiFetch(`${API_URL}/attachments/task/${taskId}`);
  if (!res.ok) throw new Error(`Failed to fetch attachments (${res.status})`);
  const data = await res.json();
  return applyAttachmentUrlCache(data.data);
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  const res = await apiFetch(`${API_URL}/attachments/${attachmentId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete attachment");
  bustAttachmentUrl(attachmentId);
}
