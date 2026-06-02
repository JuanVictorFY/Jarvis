type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
}

class Logger {
  private readonly entries: LogEntry[] = [];
  private readonly maxEntries = 500;
  private isDev = process.env['NODE_ENV'] !== 'production';

  private write(level: LogLevel, message: string, context?: string, data?: unknown): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
    };

    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    if (this.isDev || level === 'error' || level === 'warn') {
      const prefix = context ? `[${context}]` : '';
      const formatted = `[Jarvis][${level.toUpperCase()}]${prefix} ${message}`;
      if (level === 'error') {
        console.error(formatted, data ?? '');
      } else if (level === 'warn') {
        console.warn(formatted, data ?? '');
      } else {
        console.log(formatted, data ?? '');
      }
    }
  }

  debug(message: string, context?: string, data?: unknown): void {
    this.write('debug', message, context, data);
  }

  info(message: string, context?: string, data?: unknown): void {
    this.write('info', message, context, data);
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.write('warn', message, context, data);
  }

  error(message: string, context?: string, data?: unknown): void {
    this.write('error', message, context, data);
  }

  getEntries(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.entries.filter((e) => e.level === level);
    }
    return [...this.entries];
  }

  clear(): void {
    this.entries.length = 0;
  }
}

export const logger = new Logger();
