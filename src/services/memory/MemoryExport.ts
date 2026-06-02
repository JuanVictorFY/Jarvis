import { MemoryEntry } from './MemoryStore';

export function exportToJSON(entries: MemoryEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

export function exportToCSV(entries: MemoryEntry[]): string {
  const header = 'id,key,value,createdAt,updatedAt';
  const rows = entries.map(e =>
    [e.id, e.key, JSON.stringify(e.value), e.createdAt, e.updatedAt].join(',')
  );
  return [header, ...rows].join('\n');
}
