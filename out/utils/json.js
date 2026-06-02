"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeJsonParse = safeJsonParse;
exports.safeJsonStringify = safeJsonStringify;
exports.deepClone = deepClone;
exports.isJsonObject = isJsonObject;
exports.mergeDeep = mergeDeep;
function safeJsonParse(raw, fallback) {
    try {
        return JSON.parse(raw);
    }
    catch {
        return fallback;
    }
}
function safeJsonStringify(value, indent = 2) {
    try {
        return JSON.stringify(value, null, indent);
    }
    catch {
        return '{}';
    }
}
function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}
function isJsonObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function mergeDeep(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        const srcVal = source[key];
        const tgtVal = result[key];
        if (isJsonObject(srcVal) && isJsonObject(tgtVal)) {
            result[key] = mergeDeep(tgtVal, srcVal);
        }
        else if (srcVal !== undefined) {
            result[key] = srcVal;
        }
    }
    return result;
}
//# sourceMappingURL=json.js.map