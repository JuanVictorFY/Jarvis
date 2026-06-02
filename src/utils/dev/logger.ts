type Level = 'debug'|'info'|'warn'|'error';
const colors: Record<Level,string> = { debug:'\x1b[37m', info:'\x1b[36m', warn:'\x1b[33m', error:'\x1b[31m' };
export function createLogger(ns: string) {
  return (level: Level, msg: string, ...args: unknown[]) => {
    console.log(`${colors[level]}[${ns}][${level.toUpperCase()}]\x1b[0m ${msg}`, ...args);
  };
}
// patch 1
// patch 2
