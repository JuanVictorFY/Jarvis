"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionMonitorService = void 0;
const https_1 = __importDefault(require("https"));
const eventBus_1 = require("../utils/eventBus");
class ConnectionMonitorService {
    status = 'checking';
    bus = new eventBus_1.EventBus();
    intervalId = null;
    checkUrl = 'https://api.anthropic.com';
    checkIntervalMs = 30_000;
    start() {
        if (this.intervalId !== null) {
            return;
        }
        void this.check();
        this.intervalId = setInterval(() => { void this.check(); }, this.checkIntervalMs);
    }
    stop() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    getStatus() {
        return this.status;
    }
    isOnline() {
        return this.status === 'online';
    }
    onStatusChange(handler) {
        return this.bus.on('status:change', handler);
    }
    async check() {
        const previous = this.status;
        this.status = 'checking';
        const result = await this.probe();
        this.status = result ? 'online' : 'offline';
        if (this.status !== previous) {
            this.bus.emit('status:change', this.status);
        }
        return this.status;
    }
    probe() {
        return new Promise((resolve) => {
            const req = https_1.default.get(this.checkUrl, { timeout: 5_000 }, (res) => {
                resolve(res.statusCode !== undefined && res.statusCode < 500);
                res.destroy();
            });
            req.on('error', () => resolve(false));
            req.on('timeout', () => { req.destroy(); resolve(false); });
        });
    }
}
exports.ConnectionMonitorService = ConnectionMonitorService;
//# sourceMappingURL=ConnectionMonitorService.js.map