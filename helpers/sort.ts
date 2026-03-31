import { Task } from "@/types/task";

export type TaskSortKey =
  | "deadline_asc"
  | "deadline_desc"
  | "priority_asc"
  | "priority_desc"
  | "scheduled_asc"
  | "scheduled_desc"
  | "created_desc"
  | "created_asc";

const PRIORITY_ORDER = { HIGH: 1, MEDIUM: 2, LOW: 3 };

export function sortTasks(tasks: Task[], key: TaskSortKey = "deadline_asc"): Task[] {
  return [...tasks].sort((a, b) => {
    switch (key) {
      case "deadline_asc":
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      case "deadline_desc":
        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
          || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      case "priority_asc":
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
          || new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case "priority_desc":
        return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]
          || new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case "scheduled_asc":
        return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
      case "scheduled_desc":
        return new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime();
      case "created_desc":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "created_asc":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
  });
}
