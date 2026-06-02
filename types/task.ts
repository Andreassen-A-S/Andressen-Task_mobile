export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum TaskStatus {
  DONE = "DONE",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  IN_PROGRESS = "IN_PROGRESS",
  ARCHIVED = "ARCHIVED",
}

export enum TaskUnit {
  NONE = "NONE",
  HOURS = "HOURS",
  METERS = "METERS",
  KILOMETERS = "KILOMETERS",
  LITERS = "LITERS",
  KILOGRAMS = "KILOGRAMS",
  M2 = "M2",
  M3 = "M3",
  LOADS = "LOADS",
  PLUGS = "PLUGS",
  TONS = "TONS",
}

export enum TaskGoalType {
  OPEN = "OPEN",
  FIXED = "FIXED",
}

export const INACTIVE_STATUSES: TaskStatus[] = [TaskStatus.DONE, TaskStatus.ARCHIVED, TaskStatus.REJECTED];

export interface TaskGoal {
  goal_id: string;
  task_id: string;
  target_quantity: number;
  current_quantity: number;
  unit: TaskUnit;
  removed_at?: string | null;
  created_at?: string;
}

export interface Task {
  task_id: string;
  number?: number;
  project_id: string;
  project?: { name: string; color?: string | null };
  created_by: string;
  assigned_users?: string[];
  assignment_users?: { user_id: string; name: string | null; email: string | null }[];
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  created_at: string;
  updated_at: string;
  parent_task_id?: string | null;
  start_date: string;
  goal: TaskGoal | null;
  recurring_template_id?: string;
  occurrence_date?: string;
  completed_at?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  deadline?: string;
  assigned_users?: string[];
  start_date?: string;
  project_id?: string;
}
