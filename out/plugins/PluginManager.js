"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginManager = void 0;
class PluginManager {
    plugins = new Map();
    active = new Set();
    register(plugin) {
        this.plugins.set(plugin.id, plugin);
    }
    activate(id, api) {
        const p = this.plugins.get(id);
        if (!p || this.active.has(id))
            return;
        p.activate(api);
        this.active.add(id);
    }
    deactivate(id) {
        const p = this.plugins.get(id);
        if (!p || !this.active.has(id))
            return;
        p.deactivate();
        this.active.delete(id);
    }
    list() { return [...this.plugins.values()]; }
    isActive(id) { return this.active.has(id); }
}
exports.PluginManager = PluginManager;
// patch 1
// patch 2
// patch 3
// patch 4
// patch 5
// patch 6
// patch 7
// patch 8
// patch 9
// patch 10
// patch 11
// patch 12
// patch 13
// patch 14
// patch 15
// patch 16
// patch 17
// patch 18
// patch 19
//# sourceMappingURL=PluginManager.js.map