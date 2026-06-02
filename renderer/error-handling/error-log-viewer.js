'use strict';
class ErrorLogViewer {
  constructor(container) {
    this.container = container;
    this.logs = [];
  }
  add(entry) {
    this.logs.unshift(entry);
    if (this.logs.length > 100) this.logs.pop();
    this.render();
  }
  render() {
    this.container.innerHTML = this.logs.map(l =>
      `<div class="log-entry log-entry--${l.level}">[${new Date(l.ts).toISOString()}] ${l.msg}</div>`
    ).join('');
  }
  clear() {
    this.logs = [];
    this.render();
  }
}
module.exports = ErrorLogViewer;
