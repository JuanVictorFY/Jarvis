import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import type {
  WebviewToExtensionMessage,
  ExtensionToWebviewMessage,
} from '../types/messages';

export class JarvisViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = 'jarvis.chatView';

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'webview'),
      ],
    };

    webviewView.webview.html = this._buildHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(
      (raw: unknown) => this._handleMessage(raw),
    );
  }

  // ─── Outbound ───────────────────────────────────────────────────────────────

  public postMessage(message: ExtensionToWebviewMessage): void {
    this._view?.webview.postMessage(message);
  }

  // ─── Inbound ────────────────────────────────────────────────────────────────

  private _handleMessage(raw: unknown): void {
    if (!isWebviewToExtensionMessage(raw)) {
      return;
    }

    switch (raw.type) {
      case 'sendMessage':
        vscode.commands.executeCommand('jarvis.internal.handleUserMessage', raw.text);
        break;

      case 'clearHistory':
        vscode.commands.executeCommand('jarvis.clearHistory');
        break;

      case 'requestContext':
        vscode.commands.executeCommand('jarvis.internal.sendContext');
        break;

      case 'applyCode':
        vscode.commands.executeCommand('jarvis.internal.applyCode', raw.code, raw.language);
        break;

      case 'runTerminal':
        vscode.commands.executeCommand('jarvis.internal.runTerminal', raw.command);
        break;
    }
  }

  // ─── HTML ───────────────────────────────────────────────────────────────────

  private _buildHtml(webview: vscode.Webview): string {
    const htmlPath = path.join(
      this._extensionUri.fsPath,
      'webview',
      'index.html',
    );

    let html = fs.readFileSync(htmlPath, 'utf8');

    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'webview', 'styles.css'),
    );

    const nonce = generateNonce();

    html = html
      .replace(/\{\{STYLE_URI\}\}/g, styleUri.toString())
      .replace(/\{\{NONCE\}\}/g, nonce)
      .replace(/\{\{CSP_SOURCE\}\}/g, webview.cspSource);

    return html;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function isWebviewToExtensionMessage(value: unknown): value is WebviewToExtensionMessage {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const t = (value as Record<string, unknown>)['type'];
  return (
    t === 'sendMessage' ||
    t === 'clearHistory' ||
    t === 'requestContext' ||
    t === 'applyCode' ||
    t === 'runTerminal'
  );
}

function generateNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 32 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join('');
}
