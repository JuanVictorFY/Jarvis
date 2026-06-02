export interface SpeechSegment {
  text: string;
  isFinal: boolean;
  confidence: number;
  timestamp: number;
}

export class SpeechProcessor {
  private segments: SpeechSegment[] = [];

  process(text: string, isFinal: boolean, confidence = 1): SpeechSegment {
    const seg: SpeechSegment = { text, isFinal, confidence, timestamp: Date.now() };
    if (isFinal) this.segments.push(seg);
    return seg;
  }

  getTranscript(): string {
    return this.segments.map(s => s.text).join(' ');
  }

  clear(): void {
    this.segments = [];
  }
}
