export function profile<T>(label: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  console.log(`[profile] ${label}: ${(performance.now() - start).toFixed(2)}ms`);
  return result;
}

export async function profileAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  const result = await fn();
  console.log(`[profile] ${label}: ${(performance.now() - start).toFixed(2)}ms`);
  return result;
}
