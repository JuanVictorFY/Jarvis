import * as vscode from 'vscode';

export class EditorService {
  public async applyCodeToEditor(code: string, _language: string): Promise<void> {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      const choice = await vscode.window.showWarningMessage(
        'Jarvis: No active editor. Open the target file first.',
        'Open New File',
      );
      if (choice === 'Open New File') {
        await this._openInNewEditor(code);
      }
      return;
    }

    const selection = editor.selection;
    const hasSelection = !selection.isEmpty;

    if (!hasSelection) {
      const choice = await vscode.window.showInformationMessage(
        'No text selected. Where should Jarvis apply the code?',
        'Replace Entire File',
        'Open in New File',
        'Cancel',
      );

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
      : new vscode.Range(
          0,
          0,
          editor.document.lineCount - 1,
          editor.document.lineAt(editor.document.lineCount - 1).text.length,
        );

    const edit = new vscode.WorkspaceEdit();
    edit.replace(editor.document.uri, targetRange, code);

    const applied = await vscode.workspace.applyEdit(edit);
    if (!applied) {
      vscode.window.showErrorMessage('Jarvis: Failed to apply edit to the editor.');
    }
  }

  public async runInTerminal(command: string): Promise<void> {
    const trimmed = command.trim();

    const choice = await vscode.window.showInformationMessage(
      `Jarvis: Run the following command?\n\n${trimmed}`,
      { modal: true },
      'Run',
      'Cancel',
    );

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

  private async _openInNewEditor(code: string): Promise<void> {
    const doc = await vscode.workspace.openTextDocument({
      content: code,
    });
    await vscode.window.showTextDocument(doc);
  }
}
