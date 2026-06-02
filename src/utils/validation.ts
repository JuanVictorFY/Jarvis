export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidApiKey(key: unknown): key is string {
  return typeof key === 'string' && key.startsWith('sk-ant-') && key.length > 20;
}

export function isValidUrl(url: unknown): url is string {
  if (typeof url !== 'string') {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isAbsolutePath(path: unknown): path is string {
  if (typeof path !== 'string' || path.trim().length === 0) {
    return false;
  }
  return /^([a-zA-Z]:\\|\/|\\\\)/.test(path);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function assertDefined<T>(value: T | undefined | null, label: string): T {
  if (value === undefined || value === null) {
    throw new Error(`Expected ${label} to be defined`);
  }
  return value;
}

export function sanitizePath(input: string): string {
  return input.replace(/\.\.[/\\]/g, '').replace(/[<>"|?*]/g, '');
}

export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + '...';
}
