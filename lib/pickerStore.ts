import type { ListModalOption } from "@/components/userView/common/ListPicker";

type Callback = (value: string) => void;

let _callback: Callback | null = null;
let _options: ListModalOption[] | null = null;

export const pickerStore = {
  set(cb: Callback, options?: ListModalOption[]) {
    _callback = cb;
    _options = options ?? null;
  },
  call(value: string) {
    _callback?.(value);
  },
  getOptions(): ListModalOption[] | null {
    return _options;
  },
  clear() {
    _callback = null;
    _options = null;
  },
};
