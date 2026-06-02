export function sanitizeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function sanitizePath(input: string): string {
  return input.replace(/\.\.\//g, '').replace(/\\/g, '/');
}
// security patch 1
// security patch 2
// security patch 3
// security patch 4
// security patch 5
