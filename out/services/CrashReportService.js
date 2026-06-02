"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrashReportService = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class CrashReportService {
    logDir;
    maxReports = 20;
    constructor() {
        this.logDir = path_1.default.join(electron_1.app.getPath('userData'), 'crash-reports');
        fs_1.default.mkdirSync(this.logDir, { recursive: true });
    }
    record(error, context) {
        const report = {
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            context,
            appVersion: electron_1.app.getVersion(),
            platform: process.platform,
        };
        const fileName = `crash-${Date.now()}.json`;
        const filePath = path_1.default.join(this.logDir, fileName);
        try {
            fs_1.default.writeFileSync(filePath, JSON.stringify(report, null, 2));
            this.pruneOldReports();
        }
        catch {
            // crash reporter must not crash
        }
    }
    getReports() {
        try {
            return fs_1.default
                .readdirSync(this.logDir)
                .filter((f) => f.endsWith('.json'))
                .sort()
                .slice(-this.maxReports)
                .map((f) => {
                const content = fs_1.default.readFileSync(path_1.default.join(this.logDir, f), 'utf-8');
                return JSON.parse(content);
            });
        }
        catch {
            return [];
        }
    }
    clearReports() {
        try {
            fs_1.default.readdirSync(this.logDir)
                .filter((f) => f.endsWith('.json'))
                .forEach((f) => fs_1.default.unlinkSync(path_1.default.join(this.logDir, f)));
        }
        catch {
            // ignore
        }
    }
    pruneOldReports() {
        try {
            const files = fs_1.default.readdirSync(this.logDir).filter((f) => f.endsWith('.json')).sort();
            while (files.length > this.maxReports) {
                const oldest = files.shift();
                fs_1.default.unlinkSync(path_1.default.join(this.logDir, oldest));
            }
        }
        catch {
            // ignore
        }
    }
}
exports.CrashReportService = CrashReportService;
//# sourceMappingURL=CrashReportService.js.map