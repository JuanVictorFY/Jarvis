'use strict';

class WelcomeScreen {
  constructor(container) {
    this.container = container;
    this.visible = false;
  }

  show(config) {
    if (this.visible) { return; }
    this.visible = true;

    const el = document.createElement('div');
    el.id = 'welcome-screen';
    el.className = 'welcome-screen anim-fade-in';
    el.innerHTML = `
      <div class="welcome-logo">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" stroke="var(--accent)" stroke-width="2"/>
          <path d="M20 32 L32 20 L44 32 L32 44 Z" fill="var(--accent)" opacity="0.8"/>
          <circle cx="32" cy="32" r="6" fill="var(--accent)"/>
        </svg>
      </div>
      <h1 class="welcome-title">Jarvis</h1>
      <p class="welcome-subtitle">Your autonomous AI desktop agent</p>

      <div class="welcome-suggestions">
        <p class="welcome-hint">Try asking:</p>
        <div class="suggestion-chips">
          ${WELCOME_SUGGESTIONS.map((s) => `
            <button class="suggestion-chip" data-text="${s.text}">
              <span class="suggestion-icon">${s.icon}</span>
              <span>${s.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="welcome-model-info">
        <span class="model-badge">${config?.model ?? 'claude-sonnet-4-6'}</span>
        ${config?.apiKey ? '<span class="status-dot online"></span>' : '<span class="status-dot offline"></span>'}
      </div>
    `;

    el.querySelectorAll('.suggestion-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.text;
        this.hide();
        const input = document.getElementById('message-input');
        if (input) {
          input.value = text;
          input.focus();
          input.dispatchEvent(new Event('input'));
        }
      });
    });

    this.container.appendChild(el);
  }

  hide() {
    const el = document.getElementById('welcome-screen');
    if (el) {
      el.classList.add('anim-fade-out');
      setTimeout(() => el.remove(), 250);
    }
    this.visible = false;
  }

  isVisible() {
    return this.visible;
  }
}

const WELCOME_SUGGESTIONS = [
  { icon: '📁', label: 'List my downloads', text: 'List the files in my Downloads folder' },
  { icon: '🌐', label: 'Search the web', text: 'Search the web for the latest AI news' },
  { icon: '💻', label: 'Run a command', text: 'What is my current IP address?' },
  { icon: '📝', label: 'Read a file', text: 'Read the README.md from my Desktop' },
];

window.WelcomeScreen = WelcomeScreen;
