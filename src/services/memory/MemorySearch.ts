import { MemoryEntry } from './MemoryStore';

export function searchMemory(entries: MemoryEntry[], query: string): MemoryEntry[] {
  const q = query.toLowerCase();
  return entries.filter(e =>
    e.key.toLowerCase().includes(q) ||
    JSON.stringify(e.value).toLowerCase().includes(q)
  );
}
