"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceContinuousMode = void 0;
const SilenceDetector_1 = require("./SilenceDetector");
const VoiceTranscriptBuffer_1 = require("./VoiceTranscriptBuffer");
const logger_1 = require("../utils/logger");
const DEFAULTS = {
    pauseAfterSilenceMs: 3000,
    maxSessionMs: 300_000,
    autoRestart: true,
};
class VoiceContinuousMode {
    active = false;
    sessionTimer = null;
    detector;
    buffer;
    opts;
    onUtterance = null;
    constructor(_voiceService, opts = {}) {
        this.opts = { ...DEFAULTS, ...opts };
        this.detector = new SilenceDetector_1.SilenceDetector({ minSilenceDurationMs: this.opts.pauseAfterSilenceMs });
        this.buffer = new VoiceTranscriptBuffer_1.VoiceTranscriptBuffer();
    }
    async start(onUtterance) {
        if (this.active) {
            return false;
        }
        this.onUtterance = onUtterance;
        this.active = true;
        logger_1.logger.info('Continuous voice mode started', 'VoiceContinuousMode');
        this.sessionTimer = setTimeout(() => {
            void this.stop();
        }, this.opts.maxSessionMs);
        return true;
    }
    async stop() {
        if (!this.active) {
            return;
        }
        this.active = false;
        this.detector.stop();
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
        this.flush();
        logger_1.logger.info('Continuous voice mode stopped', 'VoiceContinuousMode');
    }
    isActive() {
        return this.active;
    }
    flush() {
        const text = this.buffer.flush();
        if (text.trim() && this.onUtterance) {
            this.onUtterance(text.trim());
        }
    }
}
exports.VoiceContinuousMode = VoiceContinuousMode;
//# sourceMappingURL=VoiceContinuousMode.js.map