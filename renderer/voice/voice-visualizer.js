'use strict';
class VoiceVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.analyser = null;
    this.raf = null;
  }
  attach(stream) {
    const ctx = new AudioContext();
    const src = ctx.createMediaStreamSource(stream);
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 256;
    src.connect(this.analyser);
    this._draw();
  }
  _draw() {
    const buf = new Uint8Array(this.analyser.frequencyBinCount);
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      this.analyser.getByteFrequencyData(buf);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      buf.forEach((v, i) => {
        const h = (v / 255) * this.canvas.height;
        this.ctx.fillStyle = `hsl(${i * 2}, 70%, 50%)`;
        this.ctx.fillRect(i * 4, this.canvas.height - h, 3, h);
      });
    };
    loop();
  }
  detach() { cancelAnimationFrame(this.raf); }
}
module.exports = VoiceVisualizer;
