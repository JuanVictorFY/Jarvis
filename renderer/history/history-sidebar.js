'use strict';
class HistorySidebar {
  constructor(container, onSelect, onDelete) {
    this.container = container;
    this.onSelect = onSelect;
    this.onDelete = onDelete;
  }
  render(conversations) {
    this.container.innerHTML = conversations.map(c => `
      <div class="hist-item" data-id="${c.id}">
        <span class="hist-title">${c.title}</span>
        <small class="hist-date">${new Date(c.updatedAt).toLocaleDateString()}</small>
        <button class="hist-del" data-id="${c.id}">×</button>
      </div>`).join('');
    this.container.querySelectorAll('.hist-item').forEach(el =>
      el.addEventListener('click', () => this.onSelect(el.dataset.id))
    );
    this.container.querySelectorAll('.hist-del').forEach(btn =>
      btn.addEventListener('click', (e) => { e.stopPropagation(); this.onDelete(btn.dataset.id); })
    );
  }
}
module.exports = HistorySidebar;
