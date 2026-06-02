"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseCache = void 0;
const hash_1 = require("../utils/hash");
const cache_1 = require("../utils/cache");
class ResponseCache {
    cache;
    hits = 0;
    misses = 0;
    constructor(ttlMs = 300_000) {
        this.cache = new cache_1.TTLCache(ttlMs);
    }
    buildKey(prompt, model, systemPrompt) {
        return (0, hash_1.sha256)(`${model}|${systemPrompt ?? ''}|${prompt}`);
    }
    get(prompt, model, systemPrompt) {
        const key = this.buildKey(prompt, model, systemPrompt);
        const result = this.cache.get(key);
        if (result) {
            this.hits++;
        }
        else {
            this.misses++;
        }
        return result;
    }
    set(prompt, model, response, systemPrompt) {
        const key = this.buildKey(prompt, model, systemPrompt);
        this.cache.set(key, { ...response, cachedAt: new Date() });
    }
    getStats() {
        const total = this.hits + this.misses;
        return {
            hits: this.hits,
            misses: this.misses,
            hitRate: total === 0 ? 0 : this.hits / total,
            size: this.cache.size,
        };
    }
    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }
}
exports.ResponseCache = ResponseCache;
//# sourceMappingURL=ResponseCache.js.map