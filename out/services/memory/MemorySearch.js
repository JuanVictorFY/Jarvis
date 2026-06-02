"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchMemory = searchMemory;
function searchMemory(entries, query) {
    const q = query.toLowerCase();
    return entries.filter(e => e.key.toLowerCase().includes(q) ||
        JSON.stringify(e.value).toLowerCase().includes(q));
}
//# sourceMappingURL=MemorySearch.js.map