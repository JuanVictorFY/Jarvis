'use strict';

class StatusBar {
  constructor(container) {
    this.container = container;
    this.el = null;
    this.items = new Map();
    this.connectionStatus = 'checking';
    this.tokenCount = { input: 0, output: 0 };
    this.model = '';
    this.provider = '';
  }

  mount() {
    this.el = document.createElement('div');
    this.el.id = 'status-bar';
    this.el.className = 'status-bar';
    this.container.appendChild(this.el);
    this.render();
  }

  render() {
    if (!this.el) { return; }
    this.el.innerHTML = `
      <div class="status-bar-left">
        <span class="status-connection ${this.connectionStatus}">
          <span class="status-dot ${this.connectionStatus}"></span>
          <span class="status-text">${this.getConnectionLabel()}</span>
        </span>
        ${this.model ? `<span class="status-model">${this.provider} / ${this.model}</span>` : ''}
      </div>
      <div class="status-bar-right">
        ${this.tokenCount.input + this.tokenCount.output > 0 ? `
          <span class="status-tokens" title="Input / Output tokens">
            ↑${this.formatTokens(this.tokenCount.input)} ↓${this.formatTokens(this.tokenCount.output)}
          </span>
        ` : ''}
        ${Array.from(this.items.entries()).map(([, item]) => `
          <span class="status-item ${item.class ?? ''}" title="${item.title ?? ''}">${item.text}</span>
        `).join('')}
      </div>
    `;
  }

  setConnection(status) {
    this.connectionStatus = status;
    this.render();
  }

  setModel(model, provider) {
    this.model = model;
    this.provider = provider;
    this.render();
  }

  updateTokens(input, output) {
    this.tokenCount = { input: input + this.tokenCount.input, output: output + this.tokenCount.output };
    this.render();
  }

  resetTokens() {
    this.tokenCount = { input: 0, output: 0 };
    this.render();
  }

  setItem(key, text, opts = {}) {
    this.items.set(key, { text, ...opts });
    this.render();
  }

  removeItem(key) {
    this.items.delete(key);
    this.render();
  }

  getConnectionLabel() {
    return { online: 'Connected', offline: 'Offline', checking: 'Checking...' }[this.connectionStatus] ?? '';
  }

  formatTokens(n) {
    if (n >= 1000) { return `${(n / 1000).toFixed(1)}k`; }
    return String(n);
  }

  destroy() {
    this.el?.remove();
  }
}

window.StatusBar = StatusBar;
