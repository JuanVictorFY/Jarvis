"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePath = normalizePath;
exports.safeResolvePath = safeResolvePath;
exports.getExtension = getExtension;
exports.isTextFile = isTextFile;
exports.fileExists = fileExists;
exports.ensureDir = ensureDir;
exports.getFileSizeBytes = getFileSizeBytes;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function normalizePath(inputPath) {
    return path_1.default.normalize(inputPath).replace(/\\/g, '/');
}
function safeResolvePath(base, relative) {
    const resolved = path_1.default.resolve(base, relative);
    if (!resolved.startsWith(path_1.default.resolve(base))) {
        throw new Error(`Path traversal attempt detected: ${relative}`);
    }
    return resolved;
}
function getExtension(filePath) {
    return path_1.default.extname(filePath).toLowerCase();
}
function isTextFile(filePath) {
    const textExtensions = new Set([
        '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt', '.html',
        '.css', '.scss', '.sass', '.yaml', '.yml', '.toml', '.env',
        '.sh', '.bash', '.zsh', '.py', '.rb', '.go', '.rs', '.java',
        '.c', '.cpp', '.h', '.hpp', '.cs', '.php', '.swift', '.kt',
        '.xml', '.svg', '.csv', '.sql', '.graphql', '.prisma',
    ]);
    return textExtensions.has(getExtension(filePath));
}
function fileExists(filePath) {
    try {
        fs_1.default.accessSync(filePath, fs_1.default.constants.F_OK);
        return true;
    }
    catch {
        return false;
    }
}
function ensureDir(dirPath) {
    fs_1.default.mkdirSync(dirPath, { recursive: true });
}
function getFileSizeBytes(filePath) {
    try {
        return fs_1.default.statSync(filePath).size;
    }
    catch {
        return 0;
    }
}
//# sourceMappingURL=pathUtils.js.map