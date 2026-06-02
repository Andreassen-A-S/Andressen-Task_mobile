export type CancelableNavigationTask = {
  cancel: () => void;
};

export function runAfterNavigationFrame(callback: () => void): CancelableNavigationTask {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const frame = requestAnimationFrame(() => {
    timer = setTimeout(callback, 0);
  });

  return {
    cancel: () => {
      cancelAnimationFrame(frame);
      if (timer) clearTimeout(timer);
    },
  };
}
