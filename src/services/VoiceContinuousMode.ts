import { VoiceService } from './VoiceService';
import { SilenceDetector } from './SilenceDetector';
import { VoiceTranscriptBuffer } from './VoiceTranscriptBuffer';
import { logger } from '../utils/logger';

export interface ContinuousModeOptions {
  pauseAfterSilenceMs: number;
  maxSessionMs: number;
  autoRestart: boolean;
}

const DEFAULTS: ContinuousModeOptions = {
  pauseAfterSilenceMs: 3000,
  maxSessionMs: 300_000,
  autoRestart: true,
};

export class VoiceContinuousMode {
  private active = false;
  private sessionTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly detector: SilenceDetector;
  private readonly buffer: VoiceTranscriptBuffer;
  private readonly opts: ContinuousModeOptions;
  private onUtterance: ((text: string) => void) | null = null;

  constructor(
    _voiceService: VoiceService,
    opts: Partial<ContinuousModeOptions> = {}
  ) {
    this.opts = { ...DEFAULTS, ...opts };
    this.detector = new SilenceDetector({ minSilenceDurationMs: this.opts.pauseAfterSilenceMs });
    this.buffer = new VoiceTranscriptBuffer();
  }

  async start(onUtterance: (text: string) => void): Promise<boolean> {
    if (this.active) { return false; }
    this.onUtterance = onUtterance;
    this.active = true;

    logger.info('Continuous voice mode started', 'VoiceContinuousMode');

    this.sessionTimer = setTimeout(() => {
      void this.stop();
    }, this.opts.maxSessionMs);

    return true;
  }

  async stop(): Promise<void> {
    if (!this.active) { return; }
    this.active = false;
    this.detector.stop();
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    this.flush();
    logger.info('Continuous voice mode stopped', 'VoiceContinuousMode');
  }

  isActive(): boolean {
    return this.active;
  }

  private flush(): void {
    const text = this.buffer.flush();
    if (text.trim() && this.onUtterance) {
      this.onUtterance(text.trim());
    }
  }
}
