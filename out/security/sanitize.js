"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeHTML = sanitizeHTML;
exports.sanitizePath = sanitizePath;
function sanitizeHTML(input) {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
function sanitizePath(input) {
    return input.replace(/\.\.\//g, '').replace(/\\/g, '/');
}
// security patch 1
// security patch 2
// security patch 3
// security patch 4
// security patch 5
// security patch 6
// security patch 7
// security patch 8
// security patch 9
//# sourceMappingURL=sanitize.js.map