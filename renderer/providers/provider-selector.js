'use strict';
class ProviderSelector {
  constructor(selectEl, onChange) {
    this.selectEl = selectEl;
    selectEl.addEventListener('change', () => onChange(selectEl.value));
  }
  render(providers, activeId) {
    this.selectEl.innerHTML = providers.map(p =>
      `<option value="${p.id}" ${p.id === activeId ? 'selected' : ''}>${p.name}</option>`
    ).join('');
  }
}
module.exports = ProviderSelector;
