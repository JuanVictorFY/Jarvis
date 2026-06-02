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
exports.EditorService = void 0;
const vscode = __importStar(require("vscode"));
class EditorService {
    async applyCodeToEditor(code, _language) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            const choice = await vscode.window.showWarningMessage('Jarvis: No active editor. Open the target file first.', 'Open New File');
            if (choice === 'Open New File') {
                await this._openInNewEditor(code);
            }
            return;
        }
        const selection = editor.selection;
        const hasSelection = !selection.isEmpty;
        if (!hasSelection) {
            const choice = await vscode.window.showInformationMessage('No text selected. Where should Jarvis apply the code?', 'Replace Entire File', 'Open in New File', 'Cancel');
            if (choice === 'Open in New File') {
                await this._openInNewEditor(code);
                return;
            }
            if (choice !== 'Replace Entire File') {
                return;
            }
        }
        const targetRange = hasSelection
            ? selection
            : new vscode.Range(0, 0, editor.document.lineCount - 1, editor.document.lineAt(editor.document.lineCount - 1).text.length);
        const edit = new vscode.WorkspaceEdit();
        edit.replace(editor.document.uri, targetRange, code);
        const applied = await vscode.workspace.applyEdit(edit);
        if (!applied) {
            vscode.window.showErrorMessage('Jarvis: Failed to apply edit to the editor.');
        }
    }
    async runInTerminal(command) {
        const trimmed = command.trim();
        const choice = await vscode.window.showInformationMessage(`Jarvis: Run the following command?\n\n${trimmed}`, { modal: true }, 'Run', 'Cancel');
        if (choice !== 'Run') {
            return;
        }
        const terminal = vscode.window.createTerminal({
            name: 'Jarvis',
            iconPath: new vscode.ThemeIcon('robot'),
        });
        terminal.show(true);
        terminal.sendText(trimmed);
    }
    async _openInNewEditor(code) {
        const doc = await vscode.workspace.openTextDocument({
            content: code,
        });
        await vscode.window.showTextDocument(doc);
    }
}
exports.EditorService = EditorService;
//# sourceMappingURL=EditorService.js.map