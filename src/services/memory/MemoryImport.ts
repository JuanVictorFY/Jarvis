import { MemoryEntry, MemoryStore } from './MemoryStore';

export function importFromJSON(store: MemoryStore, json: string): number {
  const entries: MemoryEntry[] = JSON.parse(json);
  entries.forEach(e => store.set(e.key, e.value));
  return entries.length;
}
