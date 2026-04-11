type Source = "camera" | "gallery" | "files";
type Callback = (source: Source) => Promise<boolean>;

let _callback: Callback | null = null;

export const attachmentPickerStore = {
  set(cb: Callback) {
    _callback = cb;
  },
  get(): Callback | null {
    return _callback;
  },
  clear() {
    _callback = null;
  },
};
