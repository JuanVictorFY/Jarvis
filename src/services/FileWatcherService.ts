import fs from 'fs';
import path from 'path';
import { EventBus } from '../utils/eventBus';

export interface FileChangeEvent {
  type: 'change' | 'rename' | 'unlink';
  filePath: string;
  timestamp: Date;
}

export class FileWatcherService {
  private readonly watchers = new Map<string, fs.FSWatcher>();
  private readonly bus = new EventBus();

  watch(filePath: string): boolean {
    if (this.watchers.has(filePath)) {
      return false;
    }

    try {
      const watcher = fs.watch(
        filePath,
        { persistent: false },
        (eventType: string, filename: string | null) => {
          const event: FileChangeEvent = {
            type: eventType === 'rename' ? 'rename' : 'change',
            filePath: filename ? path.join(path.dirname(filePath), filename) : filePath,
            timestamp: new Date(),
          };
          this.bus.emit('file:change', event);
        }
      );

      watcher.on('error', () => this.unwatch(filePath));
      this.watchers.set(filePath, watcher);
      return true;
    } catch {
      return false;
    }
  }

  unwatch(filePath: string): void {
    const watcher = this.watchers.get(filePath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(filePath);
    }
  }

  onFileChange(handler: (event: FileChangeEvent) => void): () => void {
    return this.bus.on('file:change', handler);
  }

  watchedPaths(): string[] {
    return Array.from(this.watchers.keys());
  }

  unwatchAll(): void {
    for (const [filePath] of this.watchers) {
      this.unwatch(filePath);
    }
  }
}
