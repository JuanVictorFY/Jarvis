'use strict';

function formatRelativeTime(date) {
  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 60) { return 'just now'; }
  if (diffMinutes < 60) { return `${diffMinutes}m ago`; }
  if (diffHours < 24) { return `${diffHours}h ago`; }
  return date.toLocaleDateString();
}

function formatAbsoluteTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

class MessageTimestamp {
  constructor(element, date) {
    this.element = element;
    this.date = date;
    this.updateTimer = null;
    this.useRelative = true;
  }

  mount() {
    this.render();
    this.element.addEventListener('click', () => {
      this.useRelative = !this.useRelative;
      this.render();
    });
    this.scheduleUpdate();
  }

  render() {
    const text = this.useRelative
      ? formatRelativeTime(this.date)
      : formatAbsoluteTime(this.date);

    this.element.textContent = text;
    this.element.title = this.date.toLocaleString();
    this.element.className = 'message-timestamp';
  }

  scheduleUpdate() {
    if (!this.useRelative) { return; }
    const diffMs = Date.now() - this.date.getTime();
    const interval = diffMs < 60_000 ? 15_000 : 60_000;
    this.updateTimer = setTimeout(() => {
      this.render();
      this.scheduleUpdate();
    }, interval);
  }

  destroy() {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
  }
}

function attachTimestampToMessage(messageEl, date) {
  const span = document.createElement('span');
  messageEl.appendChild(span);
  const ts = new MessageTimestamp(span, date ?? new Date());
  ts.mount();
  return ts;
}

window.MessageTimestamp = MessageTimestamp;
window.attachTimestampToMessage = attachTimestampToMessage;
