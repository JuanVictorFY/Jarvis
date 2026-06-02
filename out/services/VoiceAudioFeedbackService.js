"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceAudioFeedbackService = void 0;
const AUDIO_CUE_SCRIPTS = {
    start: `(function(){
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(880, ctx.currentTime);
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    o.start(); o.stop(ctx.currentTime + 0.15);
  })()`,
    stop: `(function(){
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(660, ctx.currentTime);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    o.start(); o.stop(ctx.currentTime + 0.1);
  })()`,
    error: `(function(){
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(220, ctx.currentTime);
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    o.start(); o.stop(ctx.currentTime + 0.2);
  })()`,
    confirm: `(function(){
    const ctx = new AudioContext();
    [440, 550, 660].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = f;
      const t = ctx.currentTime + i * 0.07;
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      o.start(t); o.stop(t + 0.1);
    });
  })()`,
};
class VoiceAudioFeedbackService {
    window;
    constructor(window) {
        this.window = window;
    }
    play(cue) {
        const script = AUDIO_CUE_SCRIPTS[cue];
        if (script) {
            this.window.webContents.executeJavaScript(script).catch(() => { });
        }
    }
}
exports.VoiceAudioFeedbackService = VoiceAudioFeedbackService;
//# sourceMappingURL=VoiceAudioFeedbackService.js.map