"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metrics = void 0;
class MetricsCollector {
    counters = new Map();
    timers = new Map();
    increment(name, by = 1) {
        this.counters.set(name, (this.counters.get(name) ?? 0) + by);
    }
    recordDuration(name, ms) {
        if (!this.timers.has(name)) {
            this.timers.set(name, []);
        }
        this.timers.get(name).push(ms);
    }
    time(name, fn) {
        const start = performance.now();
        const result = fn();
        this.recordDuration(name, performance.now() - start);
        return result;
    }
    async timeAsync(name, fn) {
        const start = performance.now();
        const result = await fn();
        this.recordDuration(name, performance.now() - start);
        return result;
    }
    getCounter(name) {
        return this.counters.get(name) ?? 0;
    }
    getTimerStats(name) {
        const samples = this.timers.get(name);
        if (!samples || samples.length === 0) {
            return null;
        }
        return {
            avg: samples.reduce((a, b) => a + b, 0) / samples.length,
            min: Math.min(...samples),
            max: Math.max(...samples),
            count: samples.length,
        };
    }
    getAllCounters() {
        return Array.from(this.counters.entries()).map(([name, value]) => ({ name, value }));
    }
    getAllTimers() {
        return Array.from(this.timers.entries()).map(([name, samples]) => ({ name, samples }));
    }
    reset() {
        this.counters.clear();
        this.timers.clear();
    }
}
exports.metrics = new MetricsCollector();
//# sourceMappingURL=metrics.js.map