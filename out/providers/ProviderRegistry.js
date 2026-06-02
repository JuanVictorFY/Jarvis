"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderRegistry = void 0;
class ProviderRegistry {
    providers = new Map();
    activeId = null;
    register(provider) { this.providers.set(provider.id, provider); }
    setActive(id) { if (!this.providers.has(id))
        throw new Error(`Unknown provider: ${id}`); this.activeId = id; }
    getActive() { return this.activeId ? (this.providers.get(this.activeId) ?? null) : null; }
    list() { return [...this.providers.values()]; }
}
exports.ProviderRegistry = ProviderRegistry;
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
// patch 20
// patch 21
// patch 22
//# sourceMappingURL=ProviderRegistry.js.map