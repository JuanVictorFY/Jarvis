"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
class RateLimiter {
    maxRequests;
    windowMs;
    timestamps = [];
    constructor(maxRequests, windowMs) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }
    canProceed() {
        const now = Date.now();
        this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
        return this.timestamps.length < this.maxRequests;
    }
    record() {
        this.timestamps.push(Date.now());
    }
    tryAcquire() {
        if (this.canProceed()) {
            this.record();
            return true;
        }
        return false;
    }
    msUntilNextSlot() {
        if (this.canProceed()) {
            return 0;
        }
        const oldest = this.timestamps[0];
        if (oldest === undefined) {
            return 0;
        }
        return this.windowMs - (Date.now() - oldest);
    }
    reset() {
        this.timestamps = [];
    }
}
exports.RateLimiter = RateLimiter;
//# sourceMappingURL=rateLimiter.js.map