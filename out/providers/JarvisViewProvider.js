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
exports.JarvisViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class JarvisViewProvider {
    _extensionUri;
    static viewId = 'jarvis.chatView';
    _view;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this._extensionUri, 'webview'),
            ],
        };
        webviewView.webview.html = this._buildHtml(webviewView.webview);
        webviewView.webview.onDidReceiveMessage((raw) => this._handleMessage(raw));
    }
    // ─── Outbound ───────────────────────────────────────────────────────────────
    postMessage(message) {
        this._view?.webview.postMessage(message);
    }
    // ─── Inbound ────────────────────────────────────────────────────────────────
    _handleMessage(raw) {
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
    _buildHtml(webview) {
        const htmlPath = path.join(this._extensionUri.fsPath, 'webview', 'index.html');
        let html = fs.readFileSync(htmlPath, 'utf8');
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'webview', 'styles.css'));
        const nonce = generateNonce();
        html = html
            .replace(/\{\{STYLE_URI\}\}/g, styleUri.toString())
            .replace(/\{\{NONCE\}\}/g, nonce)
            .replace(/\{\{CSP_SOURCE\}\}/g, webview.cspSource);
        return html;
    }
}
exports.JarvisViewProvider = JarvisViewProvider;
// ─── Helpers ────────────────────────────────────────────────────────────────
function isWebviewToExtensionMessage(value) {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const t = value['type'];
    return (t === 'sendMessage' ||
        t === 'clearHistory' ||
        t === 'requestContext' ||
        t === 'applyCode' ||
        t === 'runTerminal');
}
function generateNonce() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 32 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}
//# sourceMappingURL=JarvisViewProvider.js.map