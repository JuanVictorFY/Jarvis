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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const JarvisViewProvider_1 = require("./providers/JarvisViewProvider");
const ClaudeService_1 = require("./services/ClaudeService");
const WorkspaceService_1 = require("./services/WorkspaceService");
const EditorService_1 = require("./services/EditorService");
function activate(context) {
    const provider = new JarvisViewProvider_1.JarvisViewProvider(context.extensionUri);
    const claudeService = new ClaudeService_1.ClaudeService();
    const workspaceService = new WorkspaceService_1.WorkspaceService();
    const editorService = new EditorService_1.EditorService();
    // ── Register sidebar webview ──────────────────────────────────────────────
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(JarvisViewProvider_1.JarvisViewProvider.viewId, provider, { webviewOptions: { retainContextWhenHidden: true } }));
    // ── Phase 2+3: Stream Claude response ────────────────────────────────────
    context.subscriptions.push(vscode.commands.registerCommand('jarvis.internal.handleUserMessage', async (text) => {
        try {
            const ctx = workspaceService.getEditorContext();
            const contextString = ctx !== null ? (0, WorkspaceService_1.buildContextString)(ctx) : '';
            for await (const chunk of claudeService.stream(text, contextString)) {
                provider.postMessage({ type: 'assistantChunk', text: chunk });
            }
            provider.postMessage({ type: 'assistantDone' });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            provider.postMessage({ type: 'assistantError', error: message });
        }
    }));
    // ── Phase 4: Send active editor context to webview ───────────────────────
    context.subscriptions.push(vscode.commands.registerCommand('jarvis.internal.sendContext', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const diags = vscode.languages.getDiagnostics(editor.document.uri);
        const diagnostics = diags
            .slice(0, 5)
            .map((d) => `L${d.range.start.line + 1}: ${d.message}`)
            .join(' · ');
        provider.postMessage({
            type: 'contextSnapshot',
            fileName: editor.document.fileName,
            language: editor.document.languageId,
            selection: editor.document.getText(editor.selection),
            diagnostics,
        });
    }));
    // ── Phase 4: Auto-update context bar when editor changes ─────────────────
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (!editor) {
            return;
        }
        provider.postMessage({
            type: 'contextSnapshot',
            fileName: editor.document.fileName,
            language: editor.document.languageId,
            selection: '',
            diagnostics: '',
        });
    }));
    // ── Phase 4: Update selection pill when user selects code ─────────────────
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection((event) => {
        const selected = event.textEditor.document.getText(event.textEditor.selection);
        if (!selected) {
            return;
        }
        provider.postMessage({
            type: 'contextSnapshot',
            fileName: event.textEditor.document.fileName,
            language: event.textEditor.document.languageId,
            selection: selected,
            diagnostics: '',
        });
    }));
    // ── Phase 5: Apply code to editor ────────────────────────────────────────
    context.subscriptions.push(vscode.commands.registerCommand('jarvis.internal.applyCode', async (code, language) => {
        await editorService.applyCodeToEditor(code, language);
    }));
    // ── Phase 5: Run command in terminal (with confirmation) ──────────────────
    context.subscriptions.push(vscode.commands.registerCommand('jarvis.internal.runTerminal', async (command) => {
        await editorService.runInTerminal(command);
    }));
    // ── Public: open sidebar ──────────────────────────────────────────────────
    context.subscriptions.push(vscode.commands.registerCommand('jarvis.openChat', () => {
        vscode.commands.executeCommand('jarvis.chatView.focus');
    }));
    // ── Public: clear history ─────────────────────────────────────────────────
    context.subscriptions.push(vscode.commands.registerCommand('jarvis.clearHistory', () => {
        claudeService.clearHistory();
        provider.postMessage({ type: 'historyCleared' });
    }));
    // ── Reload Claude client if API key changes in settings ───────────────────
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('jarvis.anthropicApiKey')) {
            claudeService.resetClient();
        }
    }));
}
function deactivate() {
    // Cleanup handled by context.subscriptions
}
//# sourceMappingURL=extension.js.map