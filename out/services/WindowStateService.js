"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowStateService = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DEFAULTS = {
    width: 420,
    height: 700,
    isMaximized: false,
};
class WindowStateService {
    filePath;
    state = { ...DEFAULTS };
    constructor() {
        this.filePath = path_1.default.join(electron_1.app.getPath('userData'), 'window-state.json');
        this.load();
    }
    load() {
        try {
            const raw = fs_1.default.readFileSync(this.filePath, 'utf-8');
            const parsed = JSON.parse(raw);
            this.state = {
                width: parsed.width ?? DEFAULTS.width,
                height: parsed.height ?? DEFAULTS.height,
                isMaximized: parsed.isMaximized ?? DEFAULTS.isMaximized,
                x: parsed.x,
                y: parsed.y,
            };
        }
        catch {
            this.state = { ...DEFAULTS };
        }
    }
    save(state) {
        this.state = { ...this.state, ...state };
        try {
            fs_1.default.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2));
        }
        catch {
            // non-critical, ignore write errors
        }
    }
    get() {
        return { ...this.state };
    }
}
exports.WindowStateService = WindowStateService;
//# sourceMappingURL=WindowStateService.js.map