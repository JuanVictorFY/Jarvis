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
exports.WorkspaceService = void 0;
exports.buildContextString = buildContextString;
const vscode = __importStar(require("vscode"));
const tokenUtils_1 = require("../utils/tokenUtils");
const FILE_TOKEN_BUDGET = 3000;
const LARGE_FILE_THRESHOLD_TOKENS = 500;
class WorkspaceService {
    getEditorContext() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return null;
        }
        const doc = editor.document;
        const selection = editor.document.getText(editor.selection);
        const fullContent = doc.getText();
        const content = this._prepareFileContent(fullContent, doc.languageId);
        const diagnostics = this._formatDiagnostics(doc.uri);
        return {
            relativePath: vscode.workspace.asRelativePath(doc.uri),
            fileName: doc.fileName,
            language: doc.languageId,
            content,
            selection,
            diagnostics,
        };
    }
    async getProjectTree() {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders || folders.length === 0) {
            return '';
        }
        const root = folders[0].uri;
        try {
            const entries = await vscode.workspace.fs.readDirectory(root);
            const IGNORED = new Set(['node_modules', 'out', 'dist', '.git', '.vscode', '__pycache__']);
            return entries
                .filter(([name]) => !name.startsWith('.') && !IGNORED.has(name))
                .map(([name, fileType]) => fileType === vscode.FileType.Directory ? `${name}/` : name)
                .join('\n');
        }
        catch {
            return '';
        }
    }
    _prepareFileContent(content, language) {
        const tokens = (0, tokenUtils_1.estimateTokens)(content);
        if (tokens <= LARGE_FILE_THRESHOLD_TOKENS) {
            return content;
        }
        if (tokens > FILE_TOKEN_BUDGET * 2) {
            return (0, tokenUtils_1.extractSignatures)(content, language);
        }
        return (0, tokenUtils_1.truncateToTokenBudget)(content, FILE_TOKEN_BUDGET);
    }
    _formatDiagnostics(uri) {
        const diags = vscode.languages.getDiagnostics(uri);
        if (diags.length === 0) {
            return '';
        }
        return diags
            .slice(0, 20)
            .map((d) => {
            const line = d.range.start.line + 1;
            const severity = severityLabel(d.severity);
            return `[${severity}] Line ${line}: ${d.message}`;
        })
            .join('\n');
    }
}
exports.WorkspaceService = WorkspaceService;
function severityLabel(severity) {
    switch (severity) {
        case vscode.DiagnosticSeverity.Error: return 'ERROR';
        case vscode.DiagnosticSeverity.Warning: return 'WARN';
        case vscode.DiagnosticSeverity.Information: return 'INFO';
        default: return 'HINT';
    }
}
function buildContextString(ctx) {
    const parts = [];
    parts.push(`File: ${ctx.relativePath} (${ctx.language})`);
    if (ctx.selection.trim()) {
        parts.push(`\nSelected code:\n\`\`\`${ctx.language}\n${ctx.selection}\n\`\`\``);
    }
    else if (ctx.content.trim()) {
        parts.push(`\nFile content:\n\`\`\`${ctx.language}\n${ctx.content}\n\`\`\``);
    }
    if (ctx.diagnostics) {
        parts.push(`\nLinter diagnostics:\n${ctx.diagnostics}`);
    }
    return parts.join('\n');
}
//# sourceMappingURL=WorkspaceService.js.map