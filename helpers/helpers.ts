import parseDecimalNumber from "parse-decimal-number";
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
  const date = parseDateInput(isoDate);
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

export function toDateKey(dateInput: string | Date): string {
  const date = parseDateInput(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

export function formatGroupTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const timeStr = date.toLocaleTimeString("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

  if (date.toDateString() === now.toDateString()) return timeStr;
  if (date.toDateString() === yesterday.toDateString())
    return `I går ${timeStr}`;
  if (diffDays < 7)
    return (
      date.toLocaleDateString("da-DK", { weekday: "long" }) + ` ${timeStr}`
    );
  return (
    date.toLocaleDateString("da-DK", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    }) + ` ${timeStr}`
  );
}

// Convert YYYY-MM-DD to a full ISO 8601 UTC string for API submission
export function toIsoDate(dateString: string): string {
  return dateString + "T00:00:00.000Z";
}

export function translatePriority(priority: string): string {
  switch (priority) {
    case "LOW":
      return "Lav";
    case "MEDIUM":
      return "Mellem";
    case "HIGH":
      return "Høj";
    default:
      return priority;
  }
}

export function translateStatus(status: string): string {
  switch (status) {
    case "PENDING":
      return "Mangler";
    case "DONE":
      return "Udført";
    case "REJECTED":
      return "Annulleret";
    case "IN_PROGRESS":
      return "I gang";
    case "ARCHIVED":
      return "Arkiveret";
    default:
      return status;
  }
}

export const getPriorityColors = (priority: TaskPriority): string => {
  const map = {
    [TaskPriority.HIGH]:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900",
    [TaskPriority.MEDIUM]:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-900",
    [TaskPriority.LOW]:
      "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-900",
  };
  return map[priority];
};

export const getStatusColors = (status: TaskStatus): string => {
  const map: Record<TaskStatus, string> = {
    [TaskStatus.DONE]:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-900",
    [TaskStatus.PENDING]:
      "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-900",
    [TaskStatus.REJECTED]:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900",
    [TaskStatus.IN_PROGRESS]:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900",
    [TaskStatus.ARCHIVED]:
      "bg-surface-hover text-muted-foreground border-border dark:bg-surface-subtle dark:text-muted dark:border-border",
  };
  return map[status] ?? "bg-surface-hover text-muted-foreground border-border";
};

export const getPriorityBarColor = (priority: TaskPriority): string => {
  const map = {
    [TaskPriority.HIGH]:   "bg-red-500",
    [TaskPriority.MEDIUM]: "bg-orange-500",
    [TaskPriority.LOW]:    "bg-yellow-500",
  };
  return map[priority];
};

export const getPriorityAccentColors = (priority: TaskPriority): string => {
  const map = {
    [TaskPriority.HIGH]: "border-red-500 bg-red-100 dark:bg-red-900/40",
    [TaskPriority.MEDIUM]:
      "border-orange-500 bg-orange-100 dark:bg-orange-900/40",
    [TaskPriority.LOW]: "border-yellow-500 bg-yellow-100 dark:bg-yellow-900/40",
  };
  return map[priority];
};

export const getStatusAccentColors = (status: TaskStatus): string => {
  const map: Record<TaskStatus, string> = {
    [TaskStatus.DONE]: "border-green-500 bg-green-100 dark:bg-green-900/40",
    [TaskStatus.PENDING]:
      "border-yellow-500 bg-yellow-100 dark:bg-yellow-900/40",
    [TaskStatus.REJECTED]: "border-red-500 bg-red-100 dark:bg-red-900/40",
    [TaskStatus.IN_PROGRESS]: "border-blue-500 bg-blue-100 dark:bg-blue-900/40",
    [TaskStatus.ARCHIVED]: "border-border bg-surface-hover",
  };
  return map[status] ?? "border-border bg-surface-hover";
};

export function parseDateParam(s: string): Date {
  const [y, mo, d] = s.split("-").map(Number);
  return new Date(y, mo - 1, d);
}

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
    case "M2":
      return "m²";
    case "M3":
      return "m³";
    case "LOADS":
      return "læs";
    case "PLUGS":
      return "stik";
    case "TONS":
      return "t";
    case "NONE":
      return "%";
    default:
      return "";
  }
}

export function getTodayAssignmentStats(assignments: TaskAssignment[]) {
  const today = toDateKey(new Date());
  const assignedToday = assignments.filter(
    (a) => toDateKey(a.task.start_date) === today,
  ).length;
  const completedToday = assignments.filter(
    (a) => a.completed_at && toDateKey(a.completed_at) === today,
  ).length;
  return { assignedToday, completedToday };
}

export function parseLocalizedNumber(value: string): number {
  const s = value.trim().replace(/[\s ]/g, "");
  if (!s || s.endsWith(",") || s.endsWith(".")) return NaN;
  return parseDecimalNumber(s, { thousands: ".", decimal: "," });
}

export function formatNumber(value: number | string): string {
  return typeof value === "number" ? value.toLocaleString("da-DK") : value;
}
