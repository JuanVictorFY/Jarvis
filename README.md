# ⚡ Jarvis — AI Coding Agent for VS Code

> An autonomous, context-aware AI coding assistant powered by Claude, built natively into Visual Studio Code.

![VS Code](https://img.shields.io/badge/VS%20Code-1.85%2B-007ACC?style=flat-square&logo=visualstudiocode)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)
![Claude](https://img.shields.io/badge/Claude-Anthropic-D97757?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## Overview

Jarvis is a production-grade VS Code extension that embeds an AI coding agent directly in your sidebar. It reads your active file, selected code, and linter diagnostics in real time, sends that context to Claude, and streams the response token by token — all without leaving your editor.

It can suggest code, apply it to your editor with one click, and propose terminal commands that require your explicit confirmation before running.

---

## Features

### Context Awareness
- Automatically reads the **active file**, **current selection**, and **language** from your editor
- Injects **linter diagnostics** (`vscode.languages.getDiagnostics`) into every prompt
- Updates the context bar instantly when you switch files or make a selection
- Smart **token management**: large files are truncated or reduced to function/class signatures to stay within Claude's context window

### AI Chat with Streaming
- Real-time token-by-token streaming via `@anthropic-ai/sdk`
- Persistent **conversation history** (last 20 messages) across the session
- System prompt tuned for precise, production-quality code output
- Graceful error handling — API failures surface in the UI, not just the console

### Code Application
- Claude responses are **rendered as Markdown** with syntax-highlighted code blocks
- Every code block has a one-click **Apply** button that injects the code directly into your editor
- If you have a selection → replaces the selection. If not → prompts you with options

### Safe Terminal Execution
- Shell code blocks get a **Run** button instead of Apply
- Before any command executes, a **modal confirmation dialog** is shown with the full command
- A dedicated `Jarvis` terminal is created — your other terminals are never touched

### Native VS Code UI
- Sidebar panel that feels like a first-party VS Code tool
- All colors use `var(--vscode-*)` CSS variables — adapts to any theme automatically
- Animated streaming cursor, scrollable message thread, auto-resizing input

---

## Requirements

- Visual Studio Code `1.85.0` or higher
- An [Anthropic API key](https://console.anthropic.com/)
- Node.js `18+` (for development only)

---

## Installation

### From Source

```bash
git clone https://github.com/JuanVictorFY/Jarvis.git
cd Jarvis
npm install
npm run compile
```

Then press **F5** in VS Code to launch the Extension Development Host.

### From VSIX (once packaged)

```bash
npm install -g @vscode/vsce
vsce package
code --install-extension jarvis-0.1.0.vsix
```

---

## Configuration

Open **Settings** (`Ctrl+,`) and search for `Jarvis`:

| Setting | Default | Description |
|---|---|---|
| `jarvis.anthropicApiKey` | `""` | Your Anthropic API key (**required**) |
| `jarvis.model` | `claude-sonnet-4-6` | Claude model to use |
| `jarvis.maxTokens` | `8192` | Max tokens per response |

> Your API key is stored in VS Code's application-scoped settings and never transmitted anywhere other than Anthropic's API.

**Available models:**
- `claude-sonnet-4-6` — Recommended. Best balance of speed and quality
- `claude-opus-4-8` — Most capable, slower
- `claude-haiku-4-5-20251001` — Fastest, lighter tasks

---

## Usage

1. Click the **⚡ Jarvis** icon in the Activity Bar (left sidebar)
2. The chat panel opens — the context bar at the top shows your active file
3. Select code in your editor → the context bar updates to show the selection
4. Type your question or request and press **Enter** (or click **Send**)
5. Claude streams the response in real time
6. On code blocks:
   - Click **⬇ Apply** to inject the code into your editor
   - Click **▶ Run** to execute a shell command (confirmation required)
   - Click **Copy** to copy to clipboard

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `Enter` | Send message |
| `Shift+Enter` | Insert newline in input |

### Commands

| Command | Description |
|---|---|
| `Jarvis: Open Chat` | Focus the Jarvis sidebar panel |
| `Jarvis: Clear Conversation History` | Reset the conversation |

---

## Architecture

```
src/
├── extension.ts              # Entry point — wires all services and commands
├── providers/
│   └── JarvisViewProvider.ts # WebviewViewProvider — typed postMessage bridge
├── services/
│   ├── ClaudeService.ts      # Anthropic API client, streaming, history
│   ├── WorkspaceService.ts   # Editor context, diagnostics, project tree
│   └── EditorService.ts      # applyEdit, safe terminal execution
├── types/
│   └── messages.ts           # Discriminated union types for all messages
└── utils/
    └── tokenUtils.ts         # Token estimation, truncation, signature extraction

webview/
├── index.html                # Chat UI — markdown renderer, Apply/Run buttons
└── styles.css                # 100% VS Code CSS variables
```

### Communication Pattern

All communication between the extension backend and the Webview follows a **typed message-passing** pattern using `postMessage`. Both directions use discriminated union types defined in `src/types/messages.ts` — no `any`, no untyped payloads.

```
Webview                         Extension
  │  sendMessage / applyCode       │
  │ ──────────────────────────────▶│
  │                                │── ClaudeService.stream()
  │  assistantChunk (per token)    │       │
  │ ◀──────────────────────────────│◀──────┘
  │  assistantDone                 │
  │ ◀──────────────────────────────│
```

---

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-recompile on save)
npm run watch

# Lint
npm run lint
```

Press **F5** to open a new VS Code window with the extension loaded. Use `Ctrl+Shift+F5` to reload after changes.

### TypeScript Configuration

The project uses **strict TypeScript** with all safety flags enabled:

```json
{
  "strict": true,
  "noImplicitAny": true,
  "noImplicitReturns": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "exactOptionalPropertyTypes": true
}
```

---

## Token Management

To avoid exceeding Claude's context window, `WorkspaceService` applies a tiered strategy:

| File size | Strategy |
|---|---|
| < 500 tokens | Full content included |
| 500 – 6,000 tokens | Truncated with ellipsis at midpoint |
| > 6,000 tokens | Reduced to function/class signatures only |

If you select specific code, only the selection is sent — not the entire file.

---

## Security

- The Webview runs with a strict **Content Security Policy** (CSP) and a per-session `nonce`
- `enableScripts` is scoped to `localResourceRoots` only — no external network access from the Webview
- Terminal commands are **never executed automatically** — always require modal confirmation
- No data is stored or logged outside of VS Code's own settings storage

---

## Roadmap

- [ ] Diff view before applying code changes
- [ ] Multi-file context (include related files automatically)
- [ ] Agent mode: autonomous multi-step task execution
- [ ] Custom system prompt configuration in settings
- [ ] VSIX packaging and Marketplace publication

---

## License

MIT © [JuanVictorFY](https://github.com/JuanVictorFY)
// main patch 1
// main patch 2
// main patch 3
// main patch 4
// main patch 5
