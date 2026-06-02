import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import type { VoiceTranscript } from '../types/voice';

export interface VoiceSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  transcripts: VoiceTranscript[];
  fullText: string;
  durationMs?: number;
}

export class VoiceSessionRecorder {
  private currentSession: VoiceSession | null = null;
  private readonly storageDir: string;

  constructor() {
    this.storageDir = path.join(app.getPath('userData'), 'voice-sessions');
    fs.mkdirSync(this.storageDir, { recursive: true });
  }

  startSession(): string {
    const id = `voice-${Date.now()}`;
    this.currentSession = {
      id,
      startedAt: new Date().toISOString(),
      transcripts: [],
      fullText: '',
    };
    return id;
  }

  addTranscript(transcript: VoiceTranscript): void {
    if (!this.currentSession) { return; }
    this.currentSession.transcripts.push(transcript);
    if (transcript.isFinal) {
      this.currentSession.fullText = [
        this.currentSession.fullText,
        transcript.text,
      ].filter(Boolean).join(' ');
    }
  }

  endSession(): VoiceSession | null {
    if (!this.currentSession) { return null; }
    this.currentSession.endedAt = new Date().toISOString();
    this.currentSession.durationMs =
      new Date(this.currentSession.endedAt).getTime() -
      new Date(this.currentSession.startedAt).getTime();

    const session = this.currentSession;
    this.currentSession = null;
    this.saveSession(session);
    return session;
  }

  private saveSession(session: VoiceSession): void {
    const filePath = path.join(this.storageDir, `${session.id}.json`);
    try {
      fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
    } catch {
      // non-critical
    }
  }

  getRecentSessions(limit = 10): VoiceSession[] {
    try {
      return fs
        .readdirSync(this.storageDir)
        .filter((f) => f.endsWith('.json'))
        .sort()
        .slice(-limit)
        .map((f) => JSON.parse(fs.readFileSync(path.join(this.storageDir, f), 'utf-8')) as VoiceSession);
    } catch {
      return [];
    }
  }
}
