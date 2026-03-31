type Callback = (values: string[]) => void;

let _callback: Callback | null = null;
let _initial: string[] = [];

export const multiSelectStore = {
  set(cb: Callback, initial: string[] = []) {
    _callback = cb;
    _initial = initial;
  },
  getInitial(): string[] {
    return _initial;
  },
  call(values: string[]) {
    _callback?.(values);
  },
  clear() {
    _callback = null;
    _initial = [];
  },
};
