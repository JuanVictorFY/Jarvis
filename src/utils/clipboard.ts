import { clipboard } from 'electron';

export function copyToClipboard(text: string): void {
  clipboard.writeText(text);
}

export function readFromClipboard(): string {
  return clipboard.readText();
}

export function copyHtmlToClipboard(html: string, plain?: string): void {
  clipboard.write({ html, text: plain ?? html.replace(/<[^>]+>/g, '') });
}

export function hasClipboardText(): boolean {
  return clipboard.readText().length > 0;
}

export function clearClipboard(): void {
  clipboard.clear();
}
