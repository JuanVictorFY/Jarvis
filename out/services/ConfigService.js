"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const electron_1 = require("electron");
const DEFAULTS = {
    anthropicApiKey: '',
    model: 'claude-sonnet-4-6',
    maxTokens: 8192,
    openaiApiKey: '',
    geminiApiKey: '',
    ollamaBaseUrl: 'http://localhost:11434',
    defaultProvider: 'anthropic',
    theme: 'dark',
};
class ConfigService {
    configPath;
    config;
    constructor() {
        this.configPath = path.join(electron_1.app.getPath('userData'), 'jarvis-config.json');
        this.config = this.load();
    }
    load() {
        try {
            const raw = fs.readFileSync(this.configPath, 'utf8');
            return { ...DEFAULTS, ...JSON.parse(raw) };
        }
        catch {
            return { ...DEFAULTS };
        }
    }
    get() {
        return { ...this.config };
    }
    update(partial) {
        this.config = { ...this.config, ...partial };
        fs.mkdirSync(path.dirname(this.configPath), { recursive: true });
        fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf8');
    }
}
exports.ConfigService = ConfigService;
//# sourceMappingURL=ConfigService.js.map