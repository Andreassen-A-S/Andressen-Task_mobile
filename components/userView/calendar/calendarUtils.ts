export const WEEKDAYS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
export const DAY_CELL_HEIGHT = 38;
export const GRID_ROW_GAP = 2;
export const YEAR_RANGE = 5;

export function getDaysInMonth(date: Date): Array<{ date: Date; isCurrentMonth: boolean }> {
  const year = date.getFullYear();
  const month = date.getMonth();
  const startDow = new Date(year, month, 1).getDay();
  const prevMonthDays = startDow === 0 ? 6 : startDow - 1;
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

  for (let i = prevMonthDays; i > 0; i--) {
    days.push({ date: new Date(year, month - 1, prevMonthLastDay - i + 1), isCurrentMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }
  const remaining = days.length % 7 === 0 ? 0 : 7 - (days.length % 7);
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  }
  return days;
}

export function getGridHeight(date: Date) {
  const rows = Math.ceil(getDaysInMonth(date).length / 7);
  return rows * DAY_CELL_HEIGHT + Math.max(0, rows - 1) * GRID_ROW_GAP;
}

export function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, offset: number) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

export function getMonthDiff(from: Date, to: Date) {
  return (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth();
}
