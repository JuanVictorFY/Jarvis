"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeService = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ThemeService {
    window;
    currentTheme = 'dark';
    configPath;
    constructor(window) {
        this.window = window;
        this.configPath = path_1.default.join(electron_1.app.getPath('userData'), 'theme.json');
        this.load();
        this.bindSystemTheme();
    }
    load() {
        try {
            const raw = fs_1.default.readFileSync(this.configPath, 'utf-8');
            const parsed = JSON.parse(raw);
            this.currentTheme = parsed.theme ?? 'dark';
        }
        catch {
            this.currentTheme = 'dark';
        }
    }
    save() {
        try {
            fs_1.default.writeFileSync(this.configPath, JSON.stringify({ theme: this.currentTheme }));
        }
        catch { /* non-critical */ }
    }
    bindSystemTheme() {
        electron_1.nativeTheme.on('updated', () => {
            if (this.currentTheme === 'system') {
                this.applySystemTheme();
            }
        });
    }
    applySystemTheme() {
        const isDark = electron_1.nativeTheme.shouldUseDarkColors;
        this.sendThemeToRenderer(isDark ? 'dark' : 'light');
    }
    sendThemeToRenderer(resolved) {
        this.window.webContents.send('theme:changed', resolved);
    }
    setTheme(theme) {
        this.currentTheme = theme;
        this.save();
        if (theme === 'system') {
            electron_1.nativeTheme.themeSource = 'system';
            this.applySystemTheme();
        }
        else {
            electron_1.nativeTheme.themeSource = theme;
            this.sendThemeToRenderer(theme);
        }
    }
    getTheme() {
        return this.currentTheme;
    }
    getResolvedTheme() {
        if (this.currentTheme === 'system') {
            return electron_1.nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
        }
        return this.currentTheme;
    }
}
exports.ThemeService = ThemeService;
//# sourceMappingURL=ThemeService.js.map