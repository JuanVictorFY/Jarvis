'use strict';
class ToolSelector {
  constructor(container, onSelect) {
    this.container = container;
    this.onSelect = onSelect;
  }
  render(tools) {
    this.container.innerHTML = `<div class="tool-grid">${tools.map(t =>
      `<button class="tool-btn" data-name="${t.name}" title="${t.description}">${t.name}</button>`
    ).join('')}</div>`;
    this.container.querySelectorAll('.tool-btn').forEach(btn =>
      btn.addEventListener('click', () => this.onSelect(btn.dataset.name))
    );
  }
}
module.exports = ToolSelector;
