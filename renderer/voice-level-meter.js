'use strict';

class VoiceLevelMeter {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.analyser = null;
    this.animationId = null;
    this.dataArray = null;
  }

  async init() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      this.analyser = audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      return true;
    } catch {
      return false;
    }
  }

  start() {
    if (!this.analyser) { return; }
    this.draw();
  }

  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.clear();
  }

  draw() {
    this.analyser.getByteFrequencyData(this.dataArray);
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    const barWidth = (width / this.dataArray.length) * 2;
    let x = 0;

    for (let i = 0; i < this.dataArray.length; i++) {
      const barHeight = (this.dataArray[i] / 255) * height;
      const hue = 120 + (this.dataArray[i] / 255) * 60;
      this.ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      this.ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
      x += barWidth;
    }

    this.animationId = requestAnimationFrame(() => this.draw());
  }

  clear() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
  }
}

window.VoiceLevelMeter = VoiceLevelMeter;
