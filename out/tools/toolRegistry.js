"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalToolRegistry = exports.ToolRegistry = void 0;
class ToolRegistry {
    tools = new Map();
    register(definition) {
        this.tools.set(definition.schema.name, definition);
    }
    unregister(name) {
        this.tools.delete(name);
    }
    get(name) {
        return this.tools.get(name);
    }
    has(name) {
        return this.tools.has(name);
    }
    requiresConfirmation(name) {
        return this.tools.get(name)?.requiresConfirmation ?? false;
    }
    getSchemas() {
        return Array.from(this.tools.values()).map((def) => def.schema);
    }
    getByCategory(category) {
        return Array.from(this.tools.values()).filter((def) => def.category === category);
    }
    listNames() {
        return Array.from(this.tools.keys());
    }
    size() {
        return this.tools.size;
    }
}
exports.ToolRegistry = ToolRegistry;
exports.globalToolRegistry = new ToolRegistry();
//# sourceMappingURL=toolRegistry.js.map