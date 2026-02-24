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

export interface Task {
  task_id: string;
  created_by: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  created_at: string;
  updated_at: string;
  parent_task_id?: string | null;
  scheduled_date: string;
  unit?: TaskUnit;
  goal_type?: TaskGoalType | null;
  target_quantity?: number | null;
  current_quantity?: number | null;
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
  scheduled_date?: string;
  unit?: TaskUnit;
  goal_type?: TaskGoalType;
  target_quantity?: number | null;
  current_quantity?: number | null;
}
