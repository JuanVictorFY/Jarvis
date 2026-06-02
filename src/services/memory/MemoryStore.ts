export interface MemoryEntry {
  id: string;
  key: string;
  value: unknown;
  createdAt: number;
  updatedAt: number;
}

export class MemoryStore {
  private entries = new Map<string, MemoryEntry>();

  set(key: string, value: unknown): MemoryEntry {
    const existing = this.entries.get(key);
    const entry: MemoryEntry = {
      id: existing?.id ?? crypto.randomUUID(),
      key,
      value,
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };
    this.entries.set(key, entry);
    return entry;
  }

  get(key: string): unknown {
    return this.entries.get(key)?.value;
  }

  delete(key: string): boolean {
    return this.entries.delete(key);
  }

  all(): MemoryEntry[] {
    return [...this.entries.values()];
  }
}
// v2
// v3
// v4
// v5
// v6
// v7
// v8
