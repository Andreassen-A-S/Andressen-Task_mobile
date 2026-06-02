import { Task, TaskGoal } from "./task";
import { OrganizationSummary, PositionSummary } from "./users";

export type AssignmentTask = Omit<Task, "goal"> & {
  goal?: TaskGoal | null;
};

export interface TaskAssignment {
  assignment_id: string;
  task_id: string;
  user_id: string;
  assigned_at: string;
  completed_at: string | null;
  user: {
    user_id: string;
    name: string;
    email: string;
    position_id: string | null;
    position: PositionSummary | null;
    profile_picture_url: string | null;
    organization_id: string;
    organization?: OrganizationSummary | null;
  };
  task: AssignmentTask;
}

export interface TaskAssignmentResponse {
  success: boolean;
  data: TaskAssignment[];
}
