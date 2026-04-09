export interface TaskAttachment {
  attachment_id: string;
  comment_id: string | null;
  task_id: string;
  uploaded_by: string;
  type: "IMAGE" | "FILE";
  gcs_path: string;
  url: string;
  file_name: string | null;
  mime_type: string | null;
  created_at: string;
}

export interface TaskComment {
  comment_id: string;
  task_id: string;
  user_id: string;
  message?: string;
  created_at: string;
  updated_at: string;
  attachments: TaskAttachment[];
}

export interface CreateCommentRequest {
  message?: string;
  upload_tokens?: string[];
}
