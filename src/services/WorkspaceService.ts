import * as vscode from 'vscode';
import { truncateToTokenBudget, estimateTokens, extractSignatures } from '../utils/tokenUtils';

const FILE_TOKEN_BUDGET = 3000;
const LARGE_FILE_THRESHOLD_TOKENS = 500;

export interface EditorContext {
  relativePath: string;
  fileName: string;
  language: string;
  content: string;
  selection: string;
  diagnostics: string;
}

export class WorkspaceService {
  public getEditorContext(): EditorContext | null {
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

  public async getProjectTree(): Promise<string> {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      return '';
    }

    const root = folders[0]!.uri;

    try {
      const entries = await vscode.workspace.fs.readDirectory(root);
      const IGNORED = new Set(['node_modules', 'out', 'dist', '.git', '.vscode', '__pycache__']);

      return entries
        .filter(([name]) => !name.startsWith('.') && !IGNORED.has(name))
        .map(([name, fileType]) =>
          fileType === vscode.FileType.Directory ? `${name}/` : name,
        )
        .join('\n');
    } catch {
      return '';
    }
  }

  private _prepareFileContent(content: string, language: string): string {
    const tokens = estimateTokens(content);

    if (tokens <= LARGE_FILE_THRESHOLD_TOKENS) {
      return content;
    }

    if (tokens > FILE_TOKEN_BUDGET * 2) {
      return extractSignatures(content, language);
    }

    return truncateToTokenBudget(content, FILE_TOKEN_BUDGET);
  }

  private _formatDiagnostics(uri: vscode.Uri): string {
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

function severityLabel(severity: vscode.DiagnosticSeverity): string {
  switch (severity) {
    case vscode.DiagnosticSeverity.Error: return 'ERROR';
    case vscode.DiagnosticSeverity.Warning: return 'WARN';
    case vscode.DiagnosticSeverity.Information: return 'INFO';
    default: return 'HINT';
  }
}

export function buildContextString(ctx: EditorContext): string {
  const parts: string[] = [];

  parts.push(`File: ${ctx.relativePath} (${ctx.language})`);

  if (ctx.selection.trim()) {
    parts.push(`\nSelected code:\n\`\`\`${ctx.language}\n${ctx.selection}\n\`\`\``);
  } else if (ctx.content.trim()) {
    parts.push(`\nFile content:\n\`\`\`${ctx.language}\n${ctx.content}\n\`\`\``);
  }

  if (ctx.diagnostics) {
    parts.push(`\nLinter diagnostics:\n${ctx.diagnostics}`);
  }

  return parts.join('\n');
}
