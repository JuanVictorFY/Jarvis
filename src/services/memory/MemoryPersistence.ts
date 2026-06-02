import * as fs from 'fs/promises';
import * as path from 'path';
import { MemoryEntry } from './MemoryStore';

export class MemoryPersistence {
  constructor(private filePath: string) {}

  async save(entries: MemoryEntry[]): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(entries, null, 2), 'utf8');
  }

  async load(): Promise<MemoryEntry[]> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(raw) as MemoryEntry[];
    } catch {
      return [];
    }
  }
}
