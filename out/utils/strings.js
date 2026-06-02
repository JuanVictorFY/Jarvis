"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = slugify;
exports.camelToKebab = camelToKebab;
exports.kebabToCamel = kebabToCamel;
exports.padStart = padStart;
exports.stripAnsi = stripAnsi;
exports.countWords = countWords;
exports.countLines = countLines;
exports.extractCodeBlocks = extractCodeBlocks;
exports.escapeHtml = escapeHtml;
function slugify(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}
function camelToKebab(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
function kebabToCamel(str) {
    return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
function padStart(str, length, char = ' ') {
    return str.padStart(length, char);
}
function stripAnsi(str) {
    return str.replace(/\x1B\[[0-9;]*[mGKHF]/g, '');
}
function countWords(str) {
    return str.trim().split(/\s+/).filter(Boolean).length;
}
function countLines(str) {
    return str.split('\n').length;
}
function extractCodeBlocks(markdown) {
    const pattern = /```(\w*)\n([\s\S]*?)```/g;
    const blocks = [];
    let match;
    while ((match = pattern.exec(markdown)) !== null) {
        blocks.push({ lang: match[1] ?? '', code: match[2] ?? '' });
    }
    return blocks;
}
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
//# sourceMappingURL=strings.js.map