export type StopSequencePreset = 'none' | 'code' | 'json' | 'conversation';

const PRESETS: Record<StopSequencePreset, string[]> = {
  none: [],
  code: ['```\n\n', '---END---'],
  json: ['}\n\n', ']\n\n'],
  conversation: ['\nHuman:', '\nUser:', '\nAssistant:'],
};

export class StopSequenceManager {
  private sequences: string[] = [];

  usePreset(preset: StopSequencePreset): void {
    this.sequences = [...PRESETS[preset]];
  }

  add(sequence: string): void {
    if (!this.sequences.includes(sequence)) {
      this.sequences.push(sequence);
    }
  }

  remove(sequence: string): void {
    const idx = this.sequences.indexOf(sequence);
    if (idx !== -1) { this.sequences.splice(idx, 1); }
  }

  clear(): void {
    this.sequences = [];
  }

  get(): string[] {
    return [...this.sequences];
  }

  isEmpty(): boolean {
    return this.sequences.length === 0;
  }

  detectStop(text: string): string | null {
    return this.sequences.find((seq) => text.endsWith(seq)) ?? null;
  }
}
