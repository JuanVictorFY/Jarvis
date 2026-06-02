"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopSequenceManager = void 0;
const PRESETS = {
    none: [],
    code: ['```\n\n', '---END---'],
    json: ['}\n\n', ']\n\n'],
    conversation: ['\nHuman:', '\nUser:', '\nAssistant:'],
};
class StopSequenceManager {
    sequences = [];
    usePreset(preset) {
        this.sequences = [...PRESETS[preset]];
    }
    add(sequence) {
        if (!this.sequences.includes(sequence)) {
            this.sequences.push(sequence);
        }
    }
    remove(sequence) {
        const idx = this.sequences.indexOf(sequence);
        if (idx !== -1) {
            this.sequences.splice(idx, 1);
        }
    }
    clear() {
        this.sequences = [];
    }
    get() {
        return [...this.sequences];
    }
    isEmpty() {
        return this.sequences.length === 0;
    }
    detectStop(text) {
        return this.sequences.find((seq) => text.endsWith(seq)) ?? null;
    }
}
exports.StopSequenceManager = StopSequenceManager;
//# sourceMappingURL=StopSequenceManager.js.map