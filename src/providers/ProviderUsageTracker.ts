import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import type { ProviderType } from '../types/config';

export interface UsageRecord {
  provider: ProviderType;
  model: string;
  inputTokens: number;
  outputTokens: number;
  timestamp: string;
  durationMs: number;
}

export interface ProviderUsageSummary {
  provider: ProviderType;
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  avgDurationMs: number;
}

export class ProviderUsageTracker {
  private readonly records: UsageRecord[] = [];
  private readonly filePath: string;
  private readonly maxRecords = 1000;

  constructor() {
    this.filePath = path.join(app.getPath('userData'), 'usage-history.json');
    this.load();
  }

  record(record: Omit<UsageRecord, 'timestamp'>): void {
    this.records.push({ ...record, timestamp: new Date().toISOString() });
    if (this.records.length > this.maxRecords) {
      this.records.shift();
    }
    this.save();
  }

  getSummary(provider?: ProviderType): ProviderUsageSummary[] {
    const filtered = provider ? this.records.filter((r) => r.provider === provider) : this.records;
    const byProvider = new Map<ProviderType, UsageRecord[]>();

    for (const record of filtered) {
      const existing = byProvider.get(record.provider) ?? [];
      existing.push(record);
      byProvider.set(record.provider, existing);
    }

    return Array.from(byProvider.entries()).map(([prov, records]) => ({
      provider: prov,
      totalRequests: records.length,
      totalInputTokens: records.reduce((s, r) => s + r.inputTokens, 0),
      totalOutputTokens: records.reduce((s, r) => s + r.outputTokens, 0),
      avgDurationMs: records.reduce((s, r) => s + r.durationMs, 0) / records.length,
    }));
  }

  getRecentRecords(limit = 20): UsageRecord[] {
    return this.records.slice(-limit);
  }

  private load(): void {
    try {
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw) as UsageRecord[];
      this.records.push(...parsed.slice(-this.maxRecords));
    } catch { /* start fresh */ }
  }

  private save(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.records, null, 2));
    } catch { /* non-critical */ }
  }

  clear(): void {
    this.records.length = 0;
    this.save();
  }
}
