'use strict';
class VoiceInput {
  constructor(buttonEl, onResult) {
    this.buttonEl = buttonEl;
    this.onResult = onResult;
    this.recognition = null;
    this.active = false;
    this._init();
  }
  _init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      this.onResult(transcript, e.results[e.results.length - 1].isFinal);
    };
    this.buttonEl.addEventListener('click', () => this.toggle());
  }
  toggle() {
    this.active ? this.stop() : this.start();
  }
  start() { this.recognition?.start(); this.active = true; this.buttonEl.classList.add('active'); }
  stop()  { this.recognition?.stop();  this.active = false; this.buttonEl.classList.remove('active'); }
}
module.exports = VoiceInput;
// patch 1
// patch 2
// patch 3
// patch 4
// patch 5
// patch 6
// patch 7
// patch 8
