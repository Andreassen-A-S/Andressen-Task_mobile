type Callback = (value: string) => void;

let _callback: Callback | null = null;

export const pickerStore = {
  set(cb: Callback) {
    _callback = cb;
  },
  call(value: string) {
    _callback?.(value);
  },
  clear() {
    _callback = null;
  },
};
