import { TaskUnit } from "@/types/task";

export type GoalData = {
  target_quantity: number;
  unit: TaskUnit;
  current_quantity?: number;
};

type Callback = (goal: GoalData | null) => void;

let _callback: Callback | null = null;
let _initial: GoalData | null = null;

export const goalStore = {
  set(cb: Callback, initial: GoalData | null = null) {
    _callback = cb;
    _initial = initial;
  },
  getInitial(): GoalData | null {
    return _initial;
  },
  call(goal: GoalData | null) {
    _callback?.(goal);
  },
  clear() {
    _callback = null;
    _initial = null;
  },
};
