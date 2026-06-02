"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolRegistry = void 0;
class ToolRegistry {
    tools = new Map();
    register(tool) { this.tools.set(tool.name, tool); }
    get(name) { return this.tools.get(name); }
    list() { return [...this.tools.values()]; }
    async execute(name, input) {
        const tool = this.tools.get(name);
        if (!tool)
            throw new Error(`Unknown tool: ${name}`);
        return tool.execute(input);
    }
}
exports.ToolRegistry = ToolRegistry;
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
//# sourceMappingURL=ToolRegistry.js.map