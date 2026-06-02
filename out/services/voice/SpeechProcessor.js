"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeechProcessor = void 0;
class SpeechProcessor {
    segments = [];
    process(text, isFinal, confidence = 1) {
        const seg = { text, isFinal, confidence, timestamp: Date.now() };
        if (isFinal)
            this.segments.push(seg);
        return seg;
    }
    getTranscript() {
        return this.segments.map(s => s.text).join(' ');
    }
    clear() {
        this.segments = [];
    }
}
exports.SpeechProcessor = SpeechProcessor;
//# sourceMappingURL=SpeechProcessor.js.map