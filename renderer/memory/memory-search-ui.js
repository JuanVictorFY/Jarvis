'use strict';
class MemorySearchUI {
  constructor(inputEl, resultsEl, onSearch) {
    this.inputEl = inputEl;
    this.resultsEl = resultsEl;
    inputEl.addEventListener('input', () => onSearch(inputEl.value));
  }
  showResults(entries) {
    this.resultsEl.innerHTML = entries.length
      ? entries.map(e => `<div class="mem-result"><b>${e.key}</b></div>`).join('')
      : '<p class="mem-empty">No results</p>';
  }
}
module.exports = MemorySearchUI;
