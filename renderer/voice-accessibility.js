'use strict';

function setupVoiceAccessibility(voiceButton, indicator) {
  voiceButton.setAttribute('role', 'button');
  voiceButton.setAttribute('aria-label', 'Start voice input');
  voiceButton.setAttribute('aria-pressed', 'false');
  voiceButton.setAttribute('aria-keyshortcuts', 'v');

  indicator.setAttribute('role', 'status');
  indicator.setAttribute('aria-live', 'polite');
  indicator.setAttribute('aria-label', 'Voice recognition active');

  function updateAriaState(isListening) {
    voiceButton.setAttribute('aria-pressed', String(isListening));
    voiceButton.setAttribute(
      'aria-label',
      isListening ? 'Stop voice input' : 'Start voice input'
    );
  }

  return { updateAriaState };
}

function announceToScreenReader(message) {
  const announcer = document.getElementById('sr-announcer') || createAnnouncer();
  announcer.textContent = '';
  requestAnimationFrame(() => {
    announcer.textContent = message;
  });
}

function createAnnouncer() {
  const el = document.createElement('div');
  el.id = 'sr-announcer';
  el.setAttribute('aria-live', 'assertive');
  el.setAttribute('aria-atomic', 'true');
  el.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';
  document.body.appendChild(el);
  return el;
}

window.setupVoiceAccessibility = setupVoiceAccessibility;
window.announceToScreenReader = announceToScreenReader;
