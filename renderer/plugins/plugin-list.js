'use strict';
class PluginList {
  constructor(container, onToggle) {
    this.container = container;
    this.onToggle = onToggle;
  }
  render(plugins) {
    this.container.innerHTML = plugins.map(p => `
      <div class="plugin-item">
        <span class="plugin-name">${p.name} <small>v${p.version}</small></span>
        <label class="plugin-toggle">
          <input type="checkbox" data-id="${p.id}" ${p.enabled ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>`).join('');
    this.container.querySelectorAll('input[data-id]').forEach(cb =>
      cb.addEventListener('change', (e) => this.onToggle(e.target.dataset.id, e.target.checked))
    );
  }
}
module.exports = PluginList;
