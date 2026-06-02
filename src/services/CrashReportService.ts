import { app } from 'electron';
import fs from 'fs';
import path from 'path';

interface CrashReport {
  timestamp: string;
  error: string;
  stack?: string;
  context?: string;
  appVersion: string;
  platform: string;
}

export class CrashReportService {
  private readonly logDir: string;
  private readonly maxReports = 20;

  constructor() {
    this.logDir = path.join(app.getPath('userData'), 'crash-reports');
    fs.mkdirSync(this.logDir, { recursive: true });
  }

  record(error: unknown, context?: string): void {
    const report: CrashReport = {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
      appVersion: app.getVersion(),
      platform: process.platform,
    };

    const fileName = `crash-${Date.now()}.json`;
    const filePath = path.join(this.logDir, fileName);

    try {
      fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
      this.pruneOldReports();
    } catch {
      // crash reporter must not crash
    }
  }

  getReports(): CrashReport[] {
    try {
      return fs
        .readdirSync(this.logDir)
        .filter((f) => f.endsWith('.json'))
        .sort()
        .slice(-this.maxReports)
        .map((f) => {
          const content = fs.readFileSync(path.join(this.logDir, f), 'utf-8');
          return JSON.parse(content) as CrashReport;
        });
    } catch {
      return [];
    }
  }

  clearReports(): void {
    try {
      fs.readdirSync(this.logDir)
        .filter((f) => f.endsWith('.json'))
        .forEach((f) => fs.unlinkSync(path.join(this.logDir, f)));
    } catch {
      // ignore
    }
  }

  private pruneOldReports(): void {
    try {
      const files = fs.readdirSync(this.logDir).filter((f) => f.endsWith('.json')).sort();
      while (files.length > this.maxReports) {
        const oldest = files.shift()!;
        fs.unlinkSync(path.join(this.logDir, oldest));
      }
    } catch {
      // ignore
    }
  }
}
