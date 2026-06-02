'use strict';
class ThemeSwitcher {
  constructor(container, onSwitch) {
    this.container = container;
    this.onSwitch = onSwitch;
    this.themes = ['dark', 'light', 'solarized', 'nord', 'dracula'];
    this.current = localStorage.getItem('theme') || 'dark';
  }
  render() {
    this.container.innerHTML = `<div class="theme-switcher">${this.themes.map(t =>
      `<button class="theme-btn ${t === this.current ? 'active' : ''}" data-theme="${t}">${t}</button>`
    ).join('')}</div>`;
    this.container.querySelectorAll('.theme-btn').forEach(btn =>
      btn.addEventListener('click', () => { this.current = btn.dataset.theme; localStorage.setItem('theme', this.current); this.onSwitch(this.current); this.render(); })
    );
  }
}
module.exports = ThemeSwitcher;
// ui patch 1
// ui patch 2
// ui patch 3
// ui patch 4
// ui patch 5
// ui patch 6
// ui patch 7
// ui patch 8
// ui patch 9
