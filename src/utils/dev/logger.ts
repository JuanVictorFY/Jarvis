type Level = 'debug'|'info'|'warn'|'error';
const colors: Record<Level,string> = { debug:'\x1b[37m', info:'\x1b[36m', warn:'\x1b[33m', error:'\x1b[31m' };
export function createLogger(ns: string) {
  return (level: Level, msg: string, ...args: unknown[]) => {
    console.log(`${colors[level]}[${ns}][${level.toUpperCase()}]\x1b[0m ${msg}`, ...args);
  };
}
// patch 1
// patch 2
// patch 3
// patch 4
// patch 5
// patch 6
// patch 7
// patch 8
// patch 9
// patch 10
// patch 11
// patch 12
// patch 13
// patch 14
// patch 15
// patch 16
