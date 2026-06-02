const flags: Record<string, boolean> = {};
export function setFlag(name: string, value: boolean): void { flags[name] = value; }
export function isEnabled(name: string): boolean { return flags[name] ?? false; }
export function getAll(): Record<string, boolean> { return { ...flags }; }
// staging patch 1
// staging patch 2
// staging patch 3
// staging patch 4
// staging patch 5
// staging patch 6
// staging patch 7
