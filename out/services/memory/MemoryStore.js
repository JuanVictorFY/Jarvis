"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryStore = void 0;
class MemoryStore {
    entries = new Map();
    set(key, value) {
        const existing = this.entries.get(key);
        const entry = {
            id: existing?.id ?? crypto.randomUUID(),
            key,
            value,
            createdAt: existing?.createdAt ?? Date.now(),
            updatedAt: Date.now(),
        };
        this.entries.set(key, entry);
        return entry;
    }
    get(key) {
        return this.entries.get(key)?.value;
    }
    delete(key) {
        return this.entries.delete(key);
    }
    all() {
        return [...this.entries.values()];
    }
}
exports.MemoryStore = MemoryStore;
// v2
// v3
// v4
// v5
// v6
// v7
// v8
// v9
// v10
// v11
// v12
// v13
// v14
// v15
// v16
//# sourceMappingURL=MemoryStore.js.map