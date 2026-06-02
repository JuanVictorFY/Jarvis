"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SilenceDetector = void 0;
const DEFAULTS = {
    silenceThresholdDb: -50,
    minSilenceDurationMs: 1500,
    checkIntervalMs: 100,
};
class SilenceDetector {
    analyser = null;
    stream = null;
    context = null;
    silenceStart = null;
    intervalId = null;
    opts;
    constructor(opts = {}) {
        this.opts = { ...DEFAULTS, ...opts };
    }
    async start(onSilence) {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.context = new AudioContext();
            const source = this.context.createMediaStreamSource(this.stream);
            this.analyser = this.context.createAnalyser();
            this.analyser.fftSize = 256;
            source.connect(this.analyser);
            const data = new Float32Array(this.analyser.fftSize);
            this.intervalId = window.setInterval(() => {
                if (!this.analyser) {
                    return;
                }
                this.analyser.getFloatTimeDomainData(data);
                const rms = Math.sqrt(data.reduce((sum, v) => sum + v * v, 0) / data.length);
                const db = 20 * Math.log10(rms + 1e-10);
                if (db < this.opts.silenceThresholdDb) {
                    if (this.silenceStart === null) {
                        this.silenceStart = Date.now();
                    }
                    else if (Date.now() - this.silenceStart >= this.opts.minSilenceDurationMs) {
                        onSilence();
                        this.silenceStart = null;
                    }
                }
                else {
                    this.silenceStart = null;
                }
            }, this.opts.checkIntervalMs);
            return true;
        }
        catch {
            return false;
        }
    }
    stop() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.stream?.getTracks().forEach((t) => t.stop());
        this.context?.close().catch(() => { });
        this.analyser = null;
        this.stream = null;
        this.context = null;
        this.silenceStart = null;
    }
}
exports.SilenceDetector = SilenceDetector;
//# sourceMappingURL=SilenceDetector.js.map