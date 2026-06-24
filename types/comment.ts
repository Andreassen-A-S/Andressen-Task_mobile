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
  file_size?: number | null;
  width?: number | null;
  height?: number | null;
  created_at: string;
}

export interface TaskComment {
  comment_id: string;
  task_id: string;
  user_id: string;
  message?: string;
  reply_to_comment_id?: string | null;
  reply_preview?: string | null;
  reply_author_id?: string | null;
  reply_author_name?: string | null;
  reply_attachment_url?: string | null;
  reply_attachment_width?: number | null;
  reply_attachment_height?: number | null;
  created_at: string;
  updated_at: string;
  attachments: TaskAttachment[];
}

export interface CreateCommentRequest {
  message?: string;
  upload_tokens?: string[];
  reply_to_comment_id?: string;
  mention_user_ids?: string[];
}

export interface CommentReplyTarget {
  commentId: string;
  authorId: string;
  authorName: string;
  isOwn: boolean;
  preview: string;
  attachmentUrl?: string;
  attachmentWidth?: number;
  attachmentHeight?: number;
}
