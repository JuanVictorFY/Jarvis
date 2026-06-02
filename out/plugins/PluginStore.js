"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginStore = void 0;
class PluginStore {
    meta = [];
    add(m) { this.meta.push(m); }
    toggle(id, enabled) {
        const m = this.meta.find(x => x.id === id);
        if (m)
            m.enabled = enabled;
    }
    getAll() { return [...this.meta]; }
    getEnabled() { return this.meta.filter(m => m.enabled); }
}
exports.PluginStore = PluginStore;
//# sourceMappingURL=PluginStore.js.map