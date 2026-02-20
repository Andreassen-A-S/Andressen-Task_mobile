export interface TaskComment {
  comment_id: string;
  task_id: string;
  user_id: string;
  message: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCommentRequest {
  message: string;
}
