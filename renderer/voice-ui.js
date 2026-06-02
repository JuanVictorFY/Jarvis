'use strict';

class VoiceUI {
  constructor(voiceManager) {
    this.manager = voiceManager;
    this.button = null;
    this.indicator = null;
    this.transcriptDisplay = null;
    this.interimText = '';
  }

  mount(container) {
    this.button = document.createElement('button');
    this.button.id = 'voice-btn';
    this.button.className = 'voice-btn';
    this.button.title = 'Start voice input (V)';
    this.button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    `;

    this.indicator = document.createElement('div');
    this.indicator.className = 'voice-indicator hidden';
    this.indicator.innerHTML = `
      <span class="voice-dot"></span>
      <span class="voice-dot"></span>
      <span class="voice-dot"></span>
      <span class="voice-label">Listening...</span>
    `;

    this.transcriptDisplay = document.createElement('div');
    this.transcriptDisplay.className = 'voice-transcript hidden';

    container.appendChild(this.button);
    container.appendChild(this.indicator);
    container.appendChild(this.transcriptDisplay);

    this.bindEvents();
  }

  bindEvents() {
    this.button.addEventListener('click', () => this.toggle());

    if (window.jarvis?.voice) {
      window.jarvis.voice.onStart(() => this.setListening(true));
      window.jarvis.voice.onStop(() => this.setListening(false));
    }

    this.manager.onStateChange = (state) => {
      this.updateButtonState(state);
    };

    this.manager.onTranscript = (transcript) => {
      this.showTranscript(transcript);
      if (transcript.isFinal && window.jarvis?.voice) {
        window.jarvis.voice.sendTranscript(transcript);
      }
    };

    this.manager.onError = (error) => {
      this.showError(error.message);
      if (window.jarvis?.voice) {
        window.jarvis.voice.sendError(error);
      }
    };
  }

  toggle() {
    if (this.manager.state === 'listening') {
      this.manager.stop();
      window.jarvis?.voice?.stop();
    } else {
      const started = this.manager.start();
      if (started) {
        window.jarvis?.voice?.start();
      } else if (!this.manager.isSupported()) {
        this.showError('Voice recognition is not supported in this browser.');
      }
    }
  }

  setListening(active) {
    this.updateButtonState(active ? 'listening' : 'idle');
  }

  updateButtonState(state) {
    this.button.classList.remove('listening', 'processing', 'error');
    if (state === 'listening') {
      this.button.classList.add('listening');
      this.button.title = 'Stop voice input';
      this.indicator.classList.remove('hidden');
    } else {
      this.button.title = 'Start voice input (V)';
      this.indicator.classList.add('hidden');
    }
    if (state === 'error') {
      this.button.classList.add('error');
    }
  }

  showTranscript(transcript) {
    this.transcriptDisplay.classList.remove('hidden');
    this.transcriptDisplay.textContent = transcript.text;
    this.transcriptDisplay.classList.toggle('interim', !transcript.isFinal);
  }

  hideTranscript() {
    this.transcriptDisplay.classList.add('hidden');
    this.transcriptDisplay.textContent = '';
  }

  showError(message) {
    this.transcriptDisplay.classList.remove('hidden', 'interim');
    this.transcriptDisplay.classList.add('error');
    this.transcriptDisplay.textContent = `Voice error: ${message}`;
    setTimeout(() => {
      this.transcriptDisplay.classList.add('hidden');
      this.transcriptDisplay.classList.remove('error');
    }, 4000);
  }
}

window.VoiceUI = VoiceUI;
