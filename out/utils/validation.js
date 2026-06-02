"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNonEmptyString = isNonEmptyString;
exports.isValidApiKey = isValidApiKey;
exports.isValidUrl = isValidUrl;
exports.isAbsolutePath = isAbsolutePath;
exports.clamp = clamp;
exports.assertDefined = assertDefined;
exports.sanitizePath = sanitizePath;
exports.truncateString = truncateString;
function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}
function isValidApiKey(key) {
    return typeof key === 'string' && key.startsWith('sk-ant-') && key.length > 20;
}
function isValidUrl(url) {
    if (typeof url !== 'string') {
        return false;
    }
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    }
    catch {
        return false;
    }
}
function isAbsolutePath(path) {
    if (typeof path !== 'string' || path.trim().length === 0) {
        return false;
    }
    return /^([a-zA-Z]:\\|\/|\\\\)/.test(path);
}
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function assertDefined(value, label) {
    if (value === undefined || value === null) {
        throw new Error(`Expected ${label} to be defined`);
    }
    return value;
}
function sanitizePath(input) {
    return input.replace(/\.\.[/\\]/g, '').replace(/[<>"|?*]/g, '');
}
function truncateString(str, maxLength) {
    if (str.length <= maxLength) {
        return str;
    }
    return str.slice(0, maxLength - 3) + '...';
}
//# sourceMappingURL=validation.js.map