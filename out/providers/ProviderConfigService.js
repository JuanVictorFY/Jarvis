"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderConfigService = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DEFAULTS = {
    activeProvider: 'anthropic',
    models: {
        anthropic: 'claude-sonnet-4-6',
        openai: 'gpt-4o',
        gemini: 'gemini-2.0-flash',
    },
    apiKeys: {
        anthropic: '',
        openai: '',
        gemini: '',
    },
};
class ProviderConfigService {
    filePath;
    config = { ...DEFAULTS };
    constructor() {
        this.filePath = path_1.default.join(electron_1.app.getPath('userData'), 'provider-config.json');
        this.load();
    }
    load() {
        try {
            const raw = fs_1.default.readFileSync(this.filePath, 'utf-8');
            const parsed = JSON.parse(raw);
            this.config = {
                activeProvider: parsed.activeProvider ?? DEFAULTS.activeProvider,
                models: { ...DEFAULTS.models, ...parsed.models },
                apiKeys: { ...DEFAULTS.apiKeys, ...parsed.apiKeys },
            };
        }
        catch {
            this.config = JSON.parse(JSON.stringify(DEFAULTS));
        }
    }
    save() {
        try {
            fs_1.default.writeFileSync(this.filePath, JSON.stringify(this.config, null, 2));
        }
        catch { /* non-critical */ }
    }
    getConfig() {
        return JSON.parse(JSON.stringify(this.config));
    }
    setActiveProvider(provider) {
        this.config.activeProvider = provider;
        this.save();
    }
    setApiKey(provider, key) {
        this.config.apiKeys[provider] = key;
        this.save();
    }
    setModel(provider, model) {
        this.config.models[provider] = model;
        this.save();
    }
    getActiveModel() {
        return this.config.models[this.config.activeProvider];
    }
    getApiKey(provider) {
        return this.config.apiKeys[provider];
    }
}
exports.ProviderConfigService = ProviderConfigService;
//# sourceMappingURL=ProviderConfigService.js.map