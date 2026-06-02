"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importFromJSON = importFromJSON;
function importFromJSON(store, json) {
    const entries = JSON.parse(json);
    entries.forEach(e => store.set(e.key, e.value));
    return entries.length;
}
//# sourceMappingURL=MemoryImport.js.map