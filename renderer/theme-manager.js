'use strict';

class ThemeManager {
  constructor() {
    this.currentTheme = 'dark';
    this.systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.onThemeChange = null;
  }

  init() {
    const saved = localStorage.getItem('jarvis-theme') || 'dark';
    this.applyTheme(saved);

    this.systemMediaQuery.addEventListener('change', (e) => {
      if (this.currentTheme === 'system') {
        this.applyResolvedTheme(e.matches ? 'dark' : 'light');
      }
    });

    if (window.jarvis?.onThemeChange) {
      window.jarvis.onThemeChange((theme) => this.applyTheme(theme));
    }
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('jarvis-theme', theme);

    if (theme === 'system') {
      const isDark = this.systemMediaQuery.matches;
      this.applyResolvedTheme(isDark ? 'dark' : 'light');
    } else {
      this.applyResolvedTheme(theme);
    }
  }

  applyResolvedTheme(resolved) {
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.colorScheme = resolved;
    this.onThemeChange?.(resolved);
    this.updateToggleButton(resolved);
  }

  toggle() {
    const next = this.getResolvedTheme() === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
    window.jarvis?.setTheme?.(next);
  }

  getResolvedTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  updateToggleButton(theme) {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.title = `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`;
      btn.setAttribute('aria-label', btn.title);
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  isDark() {
    return this.getResolvedTheme() === 'dark';
  }
}

window.ThemeManager = ThemeManager;
window.themeManager = new ThemeManager();
