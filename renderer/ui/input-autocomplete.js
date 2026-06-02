'use strict';
class InputAutocomplete {
  constructor(inputEl, getSuggestions) {
    this.inputEl = inputEl;
    this.getSuggestions = getSuggestions;
    this.listEl = document.createElement('ul');
    this.listEl.className = 'autocomplete-list';
    inputEl.parentNode.appendChild(this.listEl);
    inputEl.addEventListener('input', () => this._update());
  }
  async _update() {
    const q = this.inputEl.value;
    if (!q) { this.listEl.innerHTML = ''; return; }
    const suggestions = await this.getSuggestions(q);
    this.listEl.innerHTML = suggestions.map(s =>
      `<li class="autocomplete-item" data-val="${s}">${s}</li>`
    ).join('');
    this.listEl.querySelectorAll('li').forEach(li =>
      li.addEventListener('click', () => { this.inputEl.value = li.dataset.val; this.listEl.innerHTML = ''; })
    );
  }
}
module.exports = InputAutocomplete;
