"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToUint8Array = stringToUint8Array;
exports.uint8ArrayToString = uint8ArrayToString;
exports.toBase64 = toBase64;
exports.fromBase64 = fromBase64;
exports.toBase64Url = toBase64Url;
exports.fromBase64Url = fromBase64Url;
exports.estimateByteLength = estimateByteLength;
const ENCODER = new TextEncoder();
const DECODER = new TextDecoder('utf-8');
function stringToUint8Array(str) {
    return ENCODER.encode(str);
}
function uint8ArrayToString(bytes) {
    return DECODER.decode(bytes);
}
function toBase64(str) {
    return Buffer.from(str, 'utf-8').toString('base64');
}
function fromBase64(encoded) {
    return Buffer.from(encoded, 'base64').toString('utf-8');
}
function toBase64Url(str) {
    return toBase64(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromBase64Url(encoded) {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const mod = padded.length % 4;
    const paddedStr = mod ? padded + '='.repeat(4 - mod) : padded;
    return fromBase64(paddedStr);
}
function estimateByteLength(str) {
    return ENCODER.encode(str).length;
}
//# sourceMappingURL=encoding.js.map