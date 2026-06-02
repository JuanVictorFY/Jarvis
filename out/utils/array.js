"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunk = chunk;
exports.unique = unique;
exports.uniqueBy = uniqueBy;
exports.groupBy = groupBy;
exports.sortBy = sortBy;
exports.last = last;
exports.first = first;
exports.flatten = flatten;
function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}
function unique(array) {
    return [...new Set(array)];
}
function uniqueBy(array, key) {
    const seen = new Set();
    return array.filter((item) => {
        const k = key(item);
        if (seen.has(k)) {
            return false;
        }
        seen.add(k);
        return true;
    });
}
function groupBy(array, key) {
    return array.reduce((acc, item) => {
        const k = key(item);
        if (!acc[k]) {
            acc[k] = [];
        }
        acc[k].push(item);
        return acc;
    }, {});
}
function sortBy(array, key) {
    return [...array].sort((a, b) => {
        const ka = key(a);
        const kb = key(b);
        return ka < kb ? -1 : ka > kb ? 1 : 0;
    });
}
function last(array) {
    return array[array.length - 1];
}
function first(array) {
    return array[0];
}
function flatten(array) {
    return array.reduce((acc, arr) => acc.concat(arr), []);
}
//# sourceMappingURL=array.js.map