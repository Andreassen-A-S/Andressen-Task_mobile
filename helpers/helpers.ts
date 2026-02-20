import { ViewStyle, TextStyle } from "react-native";
import { TaskPriority, TaskStatus } from "@/types/task";
import { TaskAssignment } from "@/types/assignment";

// In-memory token store for synchronous getAuthHeaders()
let _authToken: string | null = null;

export function setAuthToken(token: string | null) {
  _authToken = token;
}

export function getAuthHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(_authToken && { Authorization: `Bearer ${_authToken}` }),
  };
}

export function formatRelativeDate(isoDate: string | Date): string {
  const date =
    typeof isoDate === "string" ? new Date(isoDate.split("T")[0]) : isoDate;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "I dag";
  if (diffDays === 1) return "I morgen";
  if (diffDays === -1) return "I går";

  return target.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    ...(target.getFullYear() !== today.getFullYear() && { year: "numeric" }),
  });
}

function parseDateInput(dateInput: string | Date): Date {
  if (dateInput instanceof Date) return dateInput;
  const datePart = dateInput.split("T")[0];
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(datePart);
  if (isDateOnly) {
    const [year, month, day] = datePart.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateInput);
}

export function formatLocalDate(
  dateInput: string | Date,
  locale = "da-DK",
  options?: Intl.DateTimeFormatOptions,
) {
  const date = parseDateInput(dateInput);
  return date.toLocaleDateString(locale, options);
}

export function toLocalDateKey(dateInput: string | Date): string {
  const date = parseDateInput(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDaDate(isoDate: string | Date): string {
  const date = typeof isoDate === "string" ? new Date(isoDate) : isoDate;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatCommentDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Lige nu";
  if (diffMins < 60) return `${diffMins} min siden`;
  if (diffHours < 24) return `${diffHours} timer siden`;
  if (diffDays < 7)
    return `${diffDays} ${diffDays === 1 ? "dag" : "dage"} siden`;

  return date.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function isoToDateString(iso: string): string {
  return iso.split("T")[0];
}

export function translatePriority(priority: string): string {
  switch (priority) {
    case "LOW":
      return "LAV";
    case "MEDIUM":
      return "MELLEM";
    case "HIGH":
      return "HØJ";
    default:
      return priority;
  }
}

export function translateStatus(status: string): string {
  switch (status) {
    case "PENDING":
      return "MANGLER";
    case "DONE":
      return "AFSLUTTET";
    case "REJECTED":
      return "ANNULLERET";
    case "IN_PROGRESS":
      return "I GANG";
    case "ARCHIVED":
      return "ARKIVERET";
    default:
      return status;
  }
}

export const getPriorityColors = (
  priority: TaskPriority,
): { container: ViewStyle; text: TextStyle } => {
  const colors = {
    [TaskPriority.HIGH]: {
      container: { backgroundColor: "#FEE2E2", borderColor: "#FECACA" },
      text: { color: "#DC2626" },
    },
    [TaskPriority.MEDIUM]: {
      container: { backgroundColor: "#FFEDD5", borderColor: "#FED7AA" },
      text: { color: "#EA580C" },
    },
    [TaskPriority.LOW]: {
      container: { backgroundColor: "#FEF9C3", borderColor: "#FDE68A" },
      text: { color: "#CA8A04" },
    },
  };
  return colors[priority];
};

export const getStatusColors = (
  status: TaskStatus,
): { container: ViewStyle; text: TextStyle } => {
  const colors: Record<TaskStatus, { container: ViewStyle; text: TextStyle }> =
    {
      [TaskStatus.DONE]: {
        container: { backgroundColor: "#DCFCE7", borderColor: "#BBF7D0" },
        text: { color: "#16A34A" },
      },
      [TaskStatus.PENDING]: {
        container: { backgroundColor: "#FEF9C3", borderColor: "#FDE68A" },
        text: { color: "#CA8A04" },
      },
      [TaskStatus.REJECTED]: {
        container: { backgroundColor: "#FEE2E2", borderColor: "#FECACA" },
        text: { color: "#DC2626" },
      },
      [TaskStatus.IN_PROGRESS]: {
        container: { backgroundColor: "#DBEAFE", borderColor: "#BFDBFE" },
        text: { color: "#2563EB" },
      },
      [TaskStatus.ARCHIVED]: {
        container: { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" },
        text: { color: "#4B5563" },
      },
    };
  return (
    colors[status] ?? {
      container: { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" },
      text: { color: "#4B5563" },
    }
  );
};

export const getPriorityAccentColor = (priority: TaskPriority): string => {
  const colors = {
    [TaskPriority.HIGH]: "#dc2626",
    [TaskPriority.MEDIUM]: "#f97316",
    [TaskPriority.LOW]: "#eab308",
  };
  return colors[priority];
};

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

export function getAvatarColor(name: string): string {
  const colors = [
    "#ef4444",
    "#3b82f6",
    "#22c55e",
    "#eab308",
    "#a855f7",
    "#ec4899",
    "#6366f1",
    "#f97316",
    "#14b8a6",
    "#06b6d4",
  ];
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function translateTaskUnit(unit?: string | null): string {
  switch (unit) {
    case "HOURS":
      return "timer";
    case "METERS":
      return "m";
    case "KILOMETERS":
      return "km";
    case "LITERS":
      return "l";
    case "KILOGRAMS":
      return "kg";
    default:
      return "";
  }
}

export function getTodayAssignmentStats(assignments: TaskAssignment[]) {
  const today = toLocalDateKey(new Date());
  const assignedToday = assignments.filter(
    (a) =>
      a.task?.scheduled_date && toLocalDateKey(a.task.scheduled_date) === today,
  ).length;
  const completedToday = assignments.filter(
    (a) => a.completed_at && toLocalDateKey(a.completed_at) === today,
  ).length;
  return { assignedToday, completedToday };
}
