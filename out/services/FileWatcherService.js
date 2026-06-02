"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileWatcherService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const eventBus_1 = require("../utils/eventBus");
class FileWatcherService {
    watchers = new Map();
    bus = new eventBus_1.EventBus();
    watch(filePath) {
        if (this.watchers.has(filePath)) {
            return false;
        }
        try {
            const watcher = fs_1.default.watch(filePath, { persistent: false }, (eventType, filename) => {
                const event = {
                    type: eventType === 'rename' ? 'rename' : 'change',
                    filePath: filename ? path_1.default.join(path_1.default.dirname(filePath), filename) : filePath,
                    timestamp: new Date(),
                };
                this.bus.emit('file:change', event);
            });
            watcher.on('error', () => this.unwatch(filePath));
            this.watchers.set(filePath, watcher);
            return true;
        }
        catch {
            return false;
        }
    }
    unwatch(filePath) {
        const watcher = this.watchers.get(filePath);
        if (watcher) {
            watcher.close();
            this.watchers.delete(filePath);
        }
    }
    onFileChange(handler) {
        return this.bus.on('file:change', handler);
    }
    watchedPaths() {
        return Array.from(this.watchers.keys());
    }
    unwatchAll() {
        for (const [filePath] of this.watchers) {
            this.unwatch(filePath);
        }
    }
}
exports.FileWatcherService = FileWatcherService;
//# sourceMappingURL=FileWatcherService.js.map