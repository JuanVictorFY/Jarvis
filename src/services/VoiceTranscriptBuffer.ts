import type { VoiceTranscript } from '../types/voice';

export class VoiceTranscriptBuffer {
  private readonly finals: string[] = [];
  private interim = '';
  private readonly maxFinals: number;

  constructor(maxFinals = 50) {
    this.maxFinals = maxFinals;
  }

  push(transcript: VoiceTranscript): void {
    if (transcript.isFinal) {
      this.finals.push(transcript.text);
      this.interim = '';
      if (this.finals.length > this.maxFinals) {
        this.finals.shift();
      }
    } else {
      this.interim = transcript.text;
    }
  }

  getFullText(): string {
    const base = this.finals.join(' ');
    return this.interim ? `${base} ${this.interim}`.trim() : base;
  }

  getFinalText(): string {
    return this.finals.join(' ');
  }

  getInterimText(): string {
    return this.interim;
  }

  hasContent(): boolean {
    return this.finals.length > 0 || this.interim.length > 0;
  }

  flush(): string {
    const text = this.getFullText();
    this.finals.length = 0;
    this.interim = '';
    return text;
  }

  clear(): void {
    this.finals.length = 0;
    this.interim = '';
  }
}
