export function debounce<T extends unknown[]>(
  fn: (...args: T) => void,
  delayMs: number
): (...args: T) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: T): void => {
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delayMs);
  };
}

export function throttle<T extends unknown[]>(
  fn: (...args: T) => void,
  intervalMs: number
): (...args: T) => void {
  let lastCall = 0;

  return (...args: T): void => {
    const now = Date.now();
    if (now - lastCall >= intervalMs) {
      lastCall = now;
      fn(...args);
    }
  };
}
