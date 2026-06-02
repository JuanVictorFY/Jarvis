const ENCODER = new TextEncoder();
const DECODER = new TextDecoder('utf-8');

export function stringToUint8Array(str: string): Uint8Array {
  return ENCODER.encode(str);
}

export function uint8ArrayToString(bytes: Uint8Array): string {
  return DECODER.decode(bytes);
}

export function toBase64(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64');
}

export function fromBase64(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('utf-8');
}

export function toBase64Url(str: string): string {
  return toBase64(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(encoded: string): string {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const mod = padded.length % 4;
  const paddedStr = mod ? padded + '='.repeat(4 - mod) : padded;
  return fromBase64(paddedStr);
}

export function estimateByteLength(str: string): number {
  return ENCODER.encode(str).length;
}
