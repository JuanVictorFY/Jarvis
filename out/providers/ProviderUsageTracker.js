"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderUsageTracker = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ProviderUsageTracker {
    records = [];
    filePath;
    maxRecords = 1000;
    constructor() {
        this.filePath = path_1.default.join(electron_1.app.getPath('userData'), 'usage-history.json');
        this.load();
    }
    record(record) {
        this.records.push({ ...record, timestamp: new Date().toISOString() });
        if (this.records.length > this.maxRecords) {
            this.records.shift();
        }
        this.save();
    }
    getSummary(provider) {
        const filtered = provider ? this.records.filter((r) => r.provider === provider) : this.records;
        const byProvider = new Map();
        for (const record of filtered) {
            const existing = byProvider.get(record.provider) ?? [];
            existing.push(record);
            byProvider.set(record.provider, existing);
        }
        return Array.from(byProvider.entries()).map(([prov, records]) => ({
            provider: prov,
            totalRequests: records.length,
            totalInputTokens: records.reduce((s, r) => s + r.inputTokens, 0),
            totalOutputTokens: records.reduce((s, r) => s + r.outputTokens, 0),
            avgDurationMs: records.reduce((s, r) => s + r.durationMs, 0) / records.length,
        }));
    }
    getRecentRecords(limit = 20) {
        return this.records.slice(-limit);
    }
    load() {
        try {
            const raw = fs_1.default.readFileSync(this.filePath, 'utf-8');
            const parsed = JSON.parse(raw);
            this.records.push(...parsed.slice(-this.maxRecords));
        }
        catch { /* start fresh */ }
    }
    save() {
        try {
            fs_1.default.writeFileSync(this.filePath, JSON.stringify(this.records, null, 2));
        }
        catch { /* non-critical */ }
    }
    clear() {
        this.records.length = 0;
        this.save();
    }
}
exports.ProviderUsageTracker = ProviderUsageTracker;
//# sourceMappingURL=ProviderUsageTracker.js.map