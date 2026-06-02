"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
class Logger {
    entries = [];
    maxEntries = 500;
    isDev = process.env['NODE_ENV'] !== 'production';
    write(level, message, context, data) {
        const entry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
            data,
        };
        this.entries.push(entry);
        if (this.entries.length > this.maxEntries) {
            this.entries.shift();
        }
        if (this.isDev || level === 'error' || level === 'warn') {
            const prefix = context ? `[${context}]` : '';
            const formatted = `[Jarvis][${level.toUpperCase()}]${prefix} ${message}`;
            if (level === 'error') {
                console.error(formatted, data ?? '');
            }
            else if (level === 'warn') {
                console.warn(formatted, data ?? '');
            }
            else {
                console.log(formatted, data ?? '');
            }
        }
    }
    debug(message, context, data) {
        this.write('debug', message, context, data);
    }
    info(message, context, data) {
        this.write('info', message, context, data);
    }
    warn(message, context, data) {
        this.write('warn', message, context, data);
    }
    error(message, context, data) {
        this.write('error', message, context, data);
    }
    getEntries(level) {
        if (level) {
            return this.entries.filter((e) => e.level === level);
        }
        return [...this.entries];
    }
    clear() {
        this.entries.length = 0;
    }
}
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map