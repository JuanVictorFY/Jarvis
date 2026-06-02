'use strict';

class VoiceKeyboardHandler {
  constructor(voiceUI) {
    this.ui = voiceUI;
    this.isHoldMode = false;
    this.holdTimer = null;
    this.HOLD_THRESHOLD_MS = 300;
  }

  bindGlobalShortcut() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  handleKeyDown(e) {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
      return;
    }

    if (e.key === 'v' || e.key === 'V') {
      if (!this.holdTimer) {
        this.holdTimer = setTimeout(() => {
          this.isHoldMode = true;
          this.ui.toggle();
        }, this.HOLD_THRESHOLD_MS);
      }
    }
  }

  handleKeyUp(e) {
    if (e.key === 'v' || e.key === 'V') {
      if (this.holdTimer) {
        clearTimeout(this.holdTimer);
        this.holdTimer = null;
      }
      if (this.isHoldMode) {
        this.isHoldMode = false;
        this.ui.toggle();
      }
    }
  }

  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
  }
}

window.VoiceKeyboardHandler = VoiceKeyboardHandler;
