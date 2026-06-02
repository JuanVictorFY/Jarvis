"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceSessionRecorder = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class VoiceSessionRecorder {
    currentSession = null;
    storageDir;
    constructor() {
        this.storageDir = path_1.default.join(electron_1.app.getPath('userData'), 'voice-sessions');
        fs_1.default.mkdirSync(this.storageDir, { recursive: true });
    }
    startSession() {
        const id = `voice-${Date.now()}`;
        this.currentSession = {
            id,
            startedAt: new Date().toISOString(),
            transcripts: [],
            fullText: '',
        };
        return id;
    }
    addTranscript(transcript) {
        if (!this.currentSession) {
            return;
        }
        this.currentSession.transcripts.push(transcript);
        if (transcript.isFinal) {
            this.currentSession.fullText = [
                this.currentSession.fullText,
                transcript.text,
            ].filter(Boolean).join(' ');
        }
    }
    endSession() {
        if (!this.currentSession) {
            return null;
        }
        this.currentSession.endedAt = new Date().toISOString();
        this.currentSession.durationMs =
            new Date(this.currentSession.endedAt).getTime() -
                new Date(this.currentSession.startedAt).getTime();
        const session = this.currentSession;
        this.currentSession = null;
        this.saveSession(session);
        return session;
    }
    saveSession(session) {
        const filePath = path_1.default.join(this.storageDir, `${session.id}.json`);
        try {
            fs_1.default.writeFileSync(filePath, JSON.stringify(session, null, 2));
        }
        catch {
            // non-critical
        }
    }
    getRecentSessions(limit = 10) {
        try {
            return fs_1.default
                .readdirSync(this.storageDir)
                .filter((f) => f.endsWith('.json'))
                .sort()
                .slice(-limit)
                .map((f) => JSON.parse(fs_1.default.readFileSync(path_1.default.join(this.storageDir, f), 'utf-8')));
        }
        catch {
            return [];
        }
    }
}
exports.VoiceSessionRecorder = VoiceSessionRecorder;
//# sourceMappingURL=VoiceSessionRecorder.js.map