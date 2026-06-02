"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256 = sha256;
exports.md5 = md5;
exports.generateId = generateId;
exports.generateShortId = generateShortId;
exports.hashObject = hashObject;
const crypto_1 = __importDefault(require("crypto"));
function sha256(input) {
    return crypto_1.default.createHash('sha256').update(input, 'utf-8').digest('hex');
}
function md5(input) {
    return crypto_1.default.createHash('md5').update(input, 'utf-8').digest('hex');
}
function generateId(prefix) {
    const random = crypto_1.default.randomBytes(8).toString('hex');
    return prefix ? `${prefix}-${random}` : random;
}
function generateShortId() {
    return crypto_1.default.randomBytes(4).toString('hex');
}
function hashObject(obj) {
    return sha256(JSON.stringify(obj));
}
//# sourceMappingURL=hash.js.map