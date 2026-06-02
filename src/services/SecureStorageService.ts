import { safeStorage } from 'electron';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export class SecureStorageService {
  private readonly storePath: string;
  private readonly store = new Map<string, string>();

  constructor() {
    this.storePath = path.join(app.getPath('userData'), 'secure-store.bin');
    this.load();
  }

  private load(): void {
    try {
      if (!fs.existsSync(this.storePath)) {
        return;
      }
      const raw = fs.readFileSync(this.storePath);
      if (safeStorage.isEncryptionAvailable()) {
        const decrypted = safeStorage.decryptString(raw);
        const parsed = JSON.parse(decrypted) as Record<string, string>;
        for (const [key, value] of Object.entries(parsed)) {
          this.store.set(key, value);
        }
      }
    } catch {
      // start fresh if decryption fails
    }
  }

  private persist(): void {
    try {
      const data = JSON.stringify(Object.fromEntries(this.store));
      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(data);
        fs.writeFileSync(this.storePath, encrypted);
      }
    } catch {
      // non-critical
    }
  }

  set(key: string, value: string): void {
    this.store.set(key, value);
    this.persist();
  }

  get(key: string): string | undefined {
    return this.store.get(key);
  }

  delete(key: string): void {
    this.store.delete(key);
    this.persist();
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  isAvailable(): boolean {
    return safeStorage.isEncryptionAvailable();
  }
}
