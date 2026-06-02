const flags: Record<string, boolean> = {};
export function setFlag(name: string, value: boolean): void { flags[name] = value; }
export function isEnabled(name: string): boolean { return flags[name] ?? false; }
export function getAll(): Record<string, boolean> { return { ...flags }; }
