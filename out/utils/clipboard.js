"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyToClipboard = copyToClipboard;
exports.readFromClipboard = readFromClipboard;
exports.copyHtmlToClipboard = copyHtmlToClipboard;
exports.hasClipboardText = hasClipboardText;
exports.clearClipboard = clearClipboard;
const electron_1 = require("electron");
function copyToClipboard(text) {
    electron_1.clipboard.writeText(text);
}
function readFromClipboard() {
    return electron_1.clipboard.readText();
}
function copyHtmlToClipboard(html, plain) {
    electron_1.clipboard.write({ html, text: plain ?? html.replace(/<[^>]+>/g, '') });
}
function hasClipboardText() {
    return electron_1.clipboard.readText().length > 0;
}
function clearClipboard() {
    electron_1.clipboard.clear();
}
//# sourceMappingURL=clipboard.js.map