import path from 'path';
import fs from 'fs';

export function normalizePath(inputPath: string): string {
  return path.normalize(inputPath).replace(/\\/g, '/');
}

export function safeResolvePath(base: string, relative: string): string {
  const resolved = path.resolve(base, relative);
  if (!resolved.startsWith(path.resolve(base))) {
    throw new Error(`Path traversal attempt detected: ${relative}`);
  }
  return resolved;
}

export function getExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase();
}

export function isTextFile(filePath: string): boolean {
  const textExtensions = new Set([
    '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt', '.html',
    '.css', '.scss', '.sass', '.yaml', '.yml', '.toml', '.env',
    '.sh', '.bash', '.zsh', '.py', '.rb', '.go', '.rs', '.java',
    '.c', '.cpp', '.h', '.hpp', '.cs', '.php', '.swift', '.kt',
    '.xml', '.svg', '.csv', '.sql', '.graphql', '.prisma',
  ]);
  return textExtensions.has(getExtension(filePath));
}

export function fileExists(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function getFileSizeBytes(filePath: string): number {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}
