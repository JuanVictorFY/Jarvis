import { app } from 'electron';
import fs from 'fs';
import path from 'path';

interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

const DEFAULTS: WindowState = {
  width: 420,
  height: 700,
  isMaximized: false,
};

export class WindowStateService {
  private readonly filePath: string;
  private state: WindowState = { ...DEFAULTS };

  constructor() {
    this.filePath = path.join(app.getPath('userData'), 'window-state.json');
    this.load();
  }

  private load(): void {
    try {
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<WindowState>;
      this.state = {
        width: parsed.width ?? DEFAULTS.width,
        height: parsed.height ?? DEFAULTS.height,
        isMaximized: parsed.isMaximized ?? DEFAULTS.isMaximized,
        x: parsed.x,
        y: parsed.y,
      };
    } catch {
      this.state = { ...DEFAULTS };
    }
  }

  save(state: Partial<WindowState>): void {
    this.state = { ...this.state, ...state };
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2));
    } catch {
      // non-critical, ignore write errors
    }
  }

  get(): WindowState {
    return { ...this.state };
  }
}
