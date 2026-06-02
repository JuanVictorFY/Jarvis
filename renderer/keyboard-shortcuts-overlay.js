'use strict';

const SHORTCUTS = [
  { key: 'Ctrl+Shift+J', action: 'Toggle Jarvis window' },
  { key: 'Enter', action: 'Send message' },
  { key: 'Shift+Enter', action: 'New line in message' },
  { key: 'Ctrl+L', action: 'Clear conversation' },
  { key: 'Ctrl+F', action: 'Search messages' },
  { key: 'Ctrl+,', action: 'Open settings' },
  { key: 'Escape', action: 'Close overlay / cancel' },
  { key: 'V (hold)', action: 'Push-to-talk voice input' },
  { key: 'Ctrl+/', action: 'Show this help' },
  { key: 'Ctrl+D', action: 'Toggle dark/light theme' },
  { key: 'Ctrl+C (in result)', action: 'Copy code block' },
  { key: 'Ctrl+K', action: 'Open command palette' },
];

class KeyboardShortcutsOverlay {
  constructor() {
    this.el = null;
    this.isOpen = false;
  }

  open() {
    if (this.isOpen) { return; }
    this.isOpen = true;

    this.el = document.createElement('div');
    this.el.className = 'overlay-backdrop anim-fade-in';
    this.el.innerHTML = `
      <div class="overlay-panel anim-fade-in-up">
        <div class="overlay-header">
          <h2>Keyboard Shortcuts</h2>
          <button class="overlay-close" id="shortcuts-close" aria-label="Close">✕</button>
        </div>
        <div class="shortcuts-grid">
          ${SHORTCUTS.map((s) => `
            <div class="shortcut-row">
              <kbd class="shortcut-key">${s.key}</kbd>
              <span class="shortcut-action">${s.action}</span>
            </div>
          `).join('')}
        </div>
        <p class="shortcuts-footer">Press <kbd>Ctrl+/</kbd> or <kbd>Escape</kbd> to close</p>
      </div>
    `;

    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) { this.close(); }
    });

    this.el.querySelector('#shortcuts-close').addEventListener('click', () => this.close());

    document.addEventListener('keydown', this.onKeydown.bind(this));
    document.body.appendChild(this.el);
  }

  close() {
    this.el?.remove();
    this.el = null;
    this.isOpen = false;
    document.removeEventListener('keydown', this.onKeydown.bind(this));
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  onKeydown(e) {
    if (e.key === 'Escape') { this.close(); }
  }
}

window.KeyboardShortcutsOverlay = KeyboardShortcutsOverlay;
