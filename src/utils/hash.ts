import crypto from 'crypto';

export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf-8').digest('hex');
}

export function md5(input: string): string {
  return crypto.createHash('md5').update(input, 'utf-8').digest('hex');
}

export function generateId(prefix?: string): string {
  const random = crypto.randomBytes(8).toString('hex');
  return prefix ? `${prefix}-${random}` : random;
}

export function generateShortId(): string {
  return crypto.randomBytes(4).toString('hex');
}

export function hashObject(obj: unknown): string {
  return sha256(JSON.stringify(obj));
}
