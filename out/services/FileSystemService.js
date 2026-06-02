"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const tokenUtils_1 = require("../utils/tokenUtils");
const READ_TOKEN_BUDGET = 4000;
class FileSystemService {
    readFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        return (0, tokenUtils_1.truncateToTokenBudget)(content, READ_TOKEN_BUDGET);
    }
    writeFile(filePath, content) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content, 'utf8');
    }
    listDirectory(dirPath) {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        return entries
            .map((e) => (e.isDirectory() ? `📁 ${e.name}/` : `📄 ${e.name}`))
            .join('\n');
    }
}
exports.FileSystemService = FileSystemService;
//# sourceMappingURL=FileSystemService.js.map