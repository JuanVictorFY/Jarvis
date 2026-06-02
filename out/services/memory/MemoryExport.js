"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportToJSON = exportToJSON;
exports.exportToCSV = exportToCSV;
function exportToJSON(entries) {
    return JSON.stringify(entries, null, 2);
}
function exportToCSV(entries) {
    const header = 'id,key,value,createdAt,updatedAt';
    const rows = entries.map(e => [e.id, e.key, JSON.stringify(e.value), e.createdAt, e.updatedAt].join(','));
    return [header, ...rows].join('\n');
}
//# sourceMappingURL=MemoryExport.js.map