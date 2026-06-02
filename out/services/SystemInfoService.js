"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemInfoService = void 0;
const os_1 = __importDefault(require("os"));
class SystemInfoService {
    getSystemInfo() {
        const cpus = os_1.default.cpus();
        return {
            platform: os_1.default.platform(),
            arch: os_1.default.arch(),
            hostname: os_1.default.hostname(),
            username: os_1.default.userInfo().username,
            homeDir: os_1.default.homedir(),
            totalMemoryMB: Math.round(os_1.default.totalmem() / 1024 / 1024),
            freeMemoryMB: Math.round(os_1.default.freemem() / 1024 / 1024),
            cpuModel: cpus[0]?.model ?? 'Unknown',
            cpuCores: cpus.length,
            uptimeSeconds: Math.round(os_1.default.uptime()),
            nodeVersion: process.versions.node ?? 'unknown',
            electronVersion: process.versions.electron ?? 'unknown',
        };
    }
    getMemoryUsageMB() {
        const mem = process.memoryUsage();
        return {
            rss: Math.round(mem.rss / 1024 / 1024),
            heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
            heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
            external: Math.round(mem.external / 1024 / 1024),
        };
    }
    formatSystemInfo(info) {
        return [
            `Platform: ${info.platform} (${info.arch})`,
            `Hostname: ${info.hostname}`,
            `User: ${info.username}`,
            `Home: ${info.homeDir}`,
            `CPU: ${info.cpuModel} (${info.cpuCores} cores)`,
            `Memory: ${info.freeMemoryMB} MB free / ${info.totalMemoryMB} MB total`,
            `Uptime: ${Math.round(info.uptimeSeconds / 3600)}h ${Math.round((info.uptimeSeconds % 3600) / 60)}m`,
        ].join('\n');
    }
}
exports.SystemInfoService = SystemInfoService;
//# sourceMappingURL=SystemInfoService.js.map