'use strict';

class VoiceRecognitionManager {
  constructor() {
    this.recognition = null;
    this.state = 'idle';
    this.onTranscript = null;
    this.onStateChange = null;
    this.onError = null;
    this.silenceTimer = null;
    this.config = {
      language: 'en-US',
      silenceTimeoutMs: 2000,
      maxDurationMs: 60000,
      interimResults: true,
      confidenceThreshold: 0.7,
    };
  }

  isSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  init() {
    if (!this.isSupported()) {
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.lang = this.config.language;

    this.recognition.onstart = () => {
      this.setState('listening');
    };

    this.recognition.onresult = (event) => {
      this.clearSilenceTimer();

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        const isFinal = result.isFinal;

        if (this.onTranscript) {
          this.onTranscript({ text: transcript, confidence, isFinal, timestamp: new Date() });
        }

        if (isFinal && this.config.silenceTimeoutMs > 0) {
          this.startSilenceTimer();
        }
      }
    };

    this.recognition.onerror = (event) => {
      this.setState('error');
      if (this.onError) {
        this.onError({ code: event.error, message: this.getErrorMessage(event.error) });
      }
    };

    this.recognition.onend = () => {
      this.clearSilenceTimer();
      if (this.state !== 'error') {
        this.setState('idle');
      }
    };

    return true;
  }

  start() {
    if (!this.recognition) {
      if (!this.init()) {
        return false;
      }
    }
    try {
      this.recognition.start();
      return true;
    } catch {
      return false;
    }
  }

  stop() {
    this.clearSilenceTimer();
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  abort() {
    this.clearSilenceTimer();
    if (this.recognition) {
      this.recognition.abort();
    }
    this.setState('idle');
  }

  setLanguage(lang) {
    this.config.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  updateConfig(config) {
    Object.assign(this.config, config);
    if (this.recognition) {
      this.recognition.interimResults = this.config.interimResults;
      this.recognition.lang = this.config.language;
    }
  }

  setState(newState) {
    this.state = newState;
    if (this.onStateChange) {
      this.onStateChange(newState);
    }
  }

  startSilenceTimer() {
    this.silenceTimer = setTimeout(() => {
      this.stop();
    }, this.config.silenceTimeoutMs);
  }

  clearSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  getErrorMessage(code) {
    const messages = {
      'not-allowed': 'Microphone access denied. Please allow microphone access in browser settings.',
      'no-speech': 'No speech was detected. Please try again.',
      'audio-capture': 'No microphone found. Please connect a microphone.',
      'network': 'Network error occurred during speech recognition.',
      'aborted': 'Speech recognition was aborted.',
    };
    return messages[code] || `Speech recognition error: ${code}`;
  }
}

window.VoiceRecognitionManager = VoiceRecognitionManager;
