import * as vscode from 'vscode';
import { JarvisViewProvider } from './providers/JarvisViewProvider';
import { ClaudeService } from './services/ClaudeService';
import { WorkspaceService, buildContextString } from './services/WorkspaceService';
import { EditorService } from './services/EditorService';

export function activate(context: vscode.ExtensionContext): void {
  const provider = new JarvisViewProvider(context.extensionUri);
  const claudeService = new ClaudeService();
  const workspaceService = new WorkspaceService();
  const editorService = new EditorService();

  // ── Register sidebar webview ──────────────────────────────────────────────
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      JarvisViewProvider.viewId,
      provider,
      { webviewOptions: { retainContextWhenHidden: true } },
    ),
  );

  // ── Phase 2+3: Stream Claude response ────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'jarvis.internal.handleUserMessage',
      async (text: string) => {
        try {
          const ctx = workspaceService.getEditorContext();
          const contextString = ctx !== null ? buildContextString(ctx) : '';

          for await (const chunk of claudeService.stream(text, contextString)) {
            provider.postMessage({ type: 'assistantChunk', text: chunk });
          }

          provider.postMessage({ type: 'assistantDone' });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          provider.postMessage({ type: 'assistantError', error: message });
        }
      },
    ),
  );

  // ── Phase 4: Send active editor context to webview ───────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('jarvis.internal.sendContext', () => {
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
    }),
  );

  // ── Phase 4: Auto-update context bar when editor changes ─────────────────
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
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
    }),
  );

  // ── Phase 4: Update selection pill when user selects code ─────────────────
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((event) => {
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
    }),
  );

  // ── Phase 5: Apply code to editor ────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'jarvis.internal.applyCode',
      async (code: string, language: string) => {
        await editorService.applyCodeToEditor(code, language);
      },
    ),
  );

  // ── Phase 5: Run command in terminal (with confirmation) ──────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'jarvis.internal.runTerminal',
      async (command: string) => {
        await editorService.runInTerminal(command);
      },
    ),
  );

  // ── Public: open sidebar ──────────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('jarvis.openChat', () => {
      vscode.commands.executeCommand('jarvis.chatView.focus');
    }),
  );

  // ── Public: clear history ─────────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('jarvis.clearHistory', () => {
      claudeService.clearHistory();
      provider.postMessage({ type: 'historyCleared' });
    }),
  );

  // ── Reload Claude client if API key changes in settings ───────────────────
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('jarvis.anthropicApiKey')) {
        claudeService.resetClient();
      }
    }),
  );
}

export function deactivate(): void {
  // Cleanup handled by context.subscriptions
}
