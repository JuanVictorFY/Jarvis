"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTLCache = void 0;
class TTLCache {
    defaultTtlMs;
    store = new Map();
    constructor(defaultTtlMs) {
        this.defaultTtlMs = defaultTtlMs;
    }
    set(key, value, ttlMs) {
        this.store.set(key, {
            value,
            expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
        });
    }
    get(key) {
        const entry = this.store.get(key);
        if (!entry) {
            return undefined;
        }
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return undefined;
        }
        return entry.value;
    }
    has(key) {
        return this.get(key) !== undefined;
    }
    delete(key) {
        this.store.delete(key);
    }
    clear() {
        this.store.clear();
    }
    purgeExpired() {
        const now = Date.now();
        let removed = 0;
        for (const [key, entry] of this.store) {
            if (now > entry.expiresAt) {
                this.store.delete(key);
                removed++;
            }
        }
        return removed;
    }
    get size() {
        return this.store.size;
    }
}
exports.TTLCache = TTLCache;
//# sourceMappingURL=cache.js.map