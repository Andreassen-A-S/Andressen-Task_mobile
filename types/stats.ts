export interface UserStats {
  user_id: string;
  name?: string;
  email?: string;
  assigned_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  overdue_tasks: number;
  weekly_stats?: {
    assigned_tasks: number;
    completed_tasks: number;
    completion_rate: number;
  };
}
