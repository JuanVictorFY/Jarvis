'use strict';
class MemoryPanel {
  constructor(container) {
    this.container = container;
    this.entries = [];
  }
  update(entries) {
    this.entries = entries;
    this.render();
  }
  render() {
    this.container.innerHTML = `
      <div class="memory-panel">
        <h3>Memory (${this.entries.length})</h3>
        <ul class="memory-list">
          ${this.entries.map(e => `<li class="memory-item"><b>${e.key}</b>: ${JSON.stringify(e.value)}</li>`).join('')}
        </ul>
      </div>`;
  }
}
module.exports = MemoryPanel;

