import { app, nativeTheme, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import type { ThemeMode } from '../types/config';

export class ThemeService {
  private currentTheme: ThemeMode = 'dark';
  private readonly configPath: string;

  constructor(private readonly window: BrowserWindow) {
    this.configPath = path.join(app.getPath('userData'), 'theme.json');
    this.load();
    this.bindSystemTheme();
  }

  private load(): void {
    try {
      const raw = fs.readFileSync(this.configPath, 'utf-8');
      const parsed = JSON.parse(raw) as { theme?: ThemeMode };
      this.currentTheme = parsed.theme ?? 'dark';
    } catch {
      this.currentTheme = 'dark';
    }
  }

  private save(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify({ theme: this.currentTheme }));
    } catch { /* non-critical */ }
  }

  private bindSystemTheme(): void {
    nativeTheme.on('updated', () => {
      if (this.currentTheme === 'system') {
        this.applySystemTheme();
      }
    });
  }

  private applySystemTheme(): void {
    const isDark = nativeTheme.shouldUseDarkColors;
    this.sendThemeToRenderer(isDark ? 'dark' : 'light');
  }

  private sendThemeToRenderer(resolved: 'dark' | 'light'): void {
    this.window.webContents.send('theme:changed', resolved);
  }

  setTheme(theme: ThemeMode): void {
    this.currentTheme = theme;
    this.save();

    if (theme === 'system') {
      nativeTheme.themeSource = 'system';
      this.applySystemTheme();
    } else {
      nativeTheme.themeSource = theme;
      this.sendThemeToRenderer(theme);
    }
  }

  getTheme(): ThemeMode {
    return this.currentTheme;
  }

  getResolvedTheme(): 'dark' | 'light' {
    if (this.currentTheme === 'system') {
      return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
    }
    return this.currentTheme;
  }
}
