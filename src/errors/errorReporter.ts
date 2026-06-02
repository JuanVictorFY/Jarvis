import { AppError } from './AppError';

interface ErrorReport {
  code: string;
  message: string;
  timestamp: number;
  recoverable: boolean;
}

const reports: ErrorReport[] = [];

export function reportError(err: unknown): void {
  if (err instanceof AppError) {
    reports.push({ code: err.code, message: err.message, timestamp: Date.now(), recoverable: err.recoverable });
  } else if (err instanceof Error) {
    reports.push({ code: 'UNKNOWN', message: err.message, timestamp: Date.now(), recoverable: false });
  }
}

export function getReports(): ErrorReport[] {
  return [...reports];
}
// tested
