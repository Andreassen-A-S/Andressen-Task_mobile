type Callback = (userIds: string[]) => void;

let _callback: Callback | null = null;
let _initial: string[] = [];

export const assigneesStore = {
  set(cb: Callback, initial: string[] = []) {
    _callback = cb;
    _initial = initial;
  },
  getInitial(): string[] {
    return _initial;
  },
  call(userIds: string[]) {
    _callback?.(userIds);
  },
  clear() {
    _callback = null;
    _initial = [];
  },
};
