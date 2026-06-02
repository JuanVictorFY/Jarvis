"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceTranscriptBuffer = void 0;
class VoiceTranscriptBuffer {
    finals = [];
    interim = '';
    maxFinals;
    constructor(maxFinals = 50) {
        this.maxFinals = maxFinals;
    }
    push(transcript) {
        if (transcript.isFinal) {
            this.finals.push(transcript.text);
            this.interim = '';
            if (this.finals.length > this.maxFinals) {
                this.finals.shift();
            }
        }
        else {
            this.interim = transcript.text;
        }
    }
    getFullText() {
        const base = this.finals.join(' ');
        return this.interim ? `${base} ${this.interim}`.trim() : base;
    }
    getFinalText() {
        return this.finals.join(' ');
    }
    getInterimText() {
        return this.interim;
    }
    hasContent() {
        return this.finals.length > 0 || this.interim.length > 0;
    }
    flush() {
        const text = this.getFullText();
        this.finals.length = 0;
        this.interim = '';
        return text;
    }
    clear() {
        this.finals.length = 0;
        this.interim = '';
    }
}
exports.VoiceTranscriptBuffer = VoiceTranscriptBuffer;
//# sourceMappingURL=VoiceTranscriptBuffer.js.map