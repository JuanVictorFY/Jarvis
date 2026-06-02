type Level = 'debug' | 'info' | 'warn' | 'error';

const COLORS: Record<Level, string> = {
  debug: '\x1b[37m',
  info:  '\x1b[36m',
  warn:  '\x1b[33m',
  error: '\x1b[31m',
};
const RESET = '\x1b[0m';

export type Logger = (level: Level, msg: string, ...args: unknown[]) => void;

export function createLogger(namespace: string): Logger {
  return (level, msg, ...args) => {
    const ts = new Date().toISOString().slice(11, 23);
    const prefix = `${COLORS[level]}[${ts}][${namespace}][${level.toUpperCase()}]${RESET}`;
    if (args.length > 0) {
      console.log(prefix, msg, ...args);
    } else {
      console.log(prefix, msg);
    }
  };
}
