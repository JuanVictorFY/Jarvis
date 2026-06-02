# Jarvis — Autonomous AI Desktop Agent

> A production-grade, cross-platform desktop application that puts a fully autonomous AI agent on your machine — powered by **Ollama** (free, local) and built on Electron.

<p align="center">
  <img src="assets/icon.png" width="96" alt="Jarvis logo" />
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-0.2.0-blueviolet?style=flat-square" />
  <img alt="Electron" src="https://img.shields.io/badge/Electron-33-47848F?style=flat-square&logo=electron" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript" />
  <img alt="Ollama" src="https://img.shields.io/badge/Ollama-local%20AI-black?style=flat-square" />
  <img alt="Platform" src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey?style=flat-square" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-22c55e?style=flat-square" />
  <img alt="Tests" src="https://img.shields.io/badge/tests-node%3Atest-brightgreen?style=flat-square" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [What's New](#whats-new)
- [Getting Started with Ollama](#getting-started-with-ollama)
- [Features](#features)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [AI Providers](#ai-providers)
- [Plugin System](#plugin-system)
- [Voice Input](#voice-input)
- [Memory System](#memory-system)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Security](#security)
- [Development](#development)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

Jarvis is a standalone desktop agent that combines a rich streaming chat interface with deep tool integrations, a persistent memory store, multi-provider AI support, and an extensible plugin architecture. It runs **entirely for free** using Ollama — no API keys, no cloud, no usage costs.

Key design principles:

- **Free by default** — Ollama runs AI models locally on your machine. No subscriptions, no per-token billing.
- **Streaming-first** — every response renders token by token; the UI never blocks waiting for a complete response.
- **Provider-agnostic** — Ollama is the active backend, with optional support for Anthropic Claude, OpenAI, and Google Gemini.
- **Extensible by design** — the plugin system lets you add custom tools, UI panels, and message hooks at runtime.
- **Resilient** — agent loops have a 5-minute IPC timeout, token-aware history trimming prevents context overflow, and every tool input is validated before execution.
- **Offline-capable** — memory, history, settings, and window state persist locally; AI inference runs on your own hardware.

---

## What's New

### Latest improvements

| Area | Change |
|---|---|
| **Ollama backend** | Agent loop fully rewritten to use the Ollama HTTP API — no more dependency on `@anthropic-ai/sdk` |
| **Free by default** | Default provider is now `ollama` with model `llama3.2` — works out of the box with no API key |
| **Tool calling** | Tools use the OpenAI-compatible format supported by Ollama (llama3.2, llama3.1, mistral, qwen2.5, etc.) |
| **Streaming** | Async queue bridge between the Ollama HTTP stream and the Electron IPC event loop — text renders token by token |
| **Error UX** | Clear `ECONNREFUSED` detection — tells the user exactly what to run (`ollama serve`, `ollama pull llama3.2`) |
| **Settings panel** | Ollama section is now first; Anthropic / OpenAI / Gemini are marked optional |
| **History management** | Token-aware trimming with an 80 k-token budget |
| **Tool validation** | Required fields validated before execution |
| **Token stats** | Input / output token counters in the header bar |
| **IPC timeout** | Agent loops auto-cancel after 5 minutes |
| **Window state** | Size, position, and maximized state persist across restarts |
| **Memory IPC** | `MemoryStore` + `MemoryPersistence` fully wired — memory survives restarts |
| **Notifications IPC** | `NotificationService` wired — toasts in the renderer |
| **CSP hardened** | `script-src 'self'` — no inline scripts in the renderer |
| **Browser fallback** | `BrowserService` tries 10 Chrome/Edge/Chromium paths and falls back to plain HTTP |
| **Unit tests** | 4 test suites using Node.js built-in `node:test` |

---

## Getting Started with Ollama

Jarvis uses [Ollama](https://ollama.com) as its AI backend. Ollama runs large language models locally — it is free, private, and requires no internet connection after the model is downloaded.

### 1 — Install Ollama

Download and install from **[ollama.com/download](https://ollama.com/download)** (Windows / macOS / Linux).

### 2 — Start the server

```bash
ollama serve
```

### 3 — Download a model

```bash
# Recommended — small, fast, supports tool calling
ollama pull llama3.2

# More capable, larger (4.7 GB)
ollama pull llama3.1

# Good alternative
ollama pull mistral
```

### 4 — Launch Jarvis

```bash
npm run dev
```

Jarvis connects to `http://localhost:11434` automatically. No API key needed.

### Models that support tool calling

The agent uses tools (read files, run commands, browse the web) — this requires a model that supports function calling:

| Model | Tool calling | Size |
|---|---|---|
| `llama3.2` | ✅ | ~2 GB |
| `llama3.1` | ✅ | ~4.7 GB |
| `llama3.3` | ✅ | ~43 GB |
| `mistral` | ✅ | ~4.1 GB |
| `qwen2.5` | ✅ | ~4.7 GB |
| `qwen2.5-coder` | ✅ | ~4.7 GB |
| `phi4` | ⚠️ partial | ~9 GB |
| `gemma3` | ❌ | ~3 GB |

---

## Features

### AI Chat & Streaming
- True token-by-token streaming via the Ollama HTTP API — text appears as it is generated
- Full Markdown rendering with syntax-highlighted code blocks
- **Live token counter** in the header: session input and output tokens updated after every response
- 5-minute agent timeout with user-visible error message
- Graceful error surfaces — failures appear inline, never silently swallowed
- Friendly error message when Ollama is not running

### Conversation History
- Persistent conversation store with full CRUD, exposed via IPC
- Sidebar with title, last-updated timestamp, and one-click deletion
- Conversations sorted by most recently updated

### Memory System
- Key-value store with UUID-based entries and `createdAt` / `updatedAt` timestamps
- **File-backed JSON persistence** — automatically saved on every write and on app exit, restored on startup
- Full-text search across all keys and values
- JSON and CSV export / import
- Live memory panel in the renderer, accessible via `window.jarvis.memory`

### Voice Input
- Web Speech API integration with continuous mode and interim result display
- Real-time frequency-bar visualizer using the Web Audio API
- Silence detection, noise cancellation config, and session recording
- Fallback service for environments without native speech support

### Multi-Provider AI
- **Ollama** — default provider; any locally running model via `http://localhost:11434` — **free, no API key**
- **Anthropic Claude** (Opus 4.8, Sonnet 4.6, Haiku 4.5) — optional, requires API key
- **OpenAI** (GPT-4o, GPT-4-turbo, GPT-3.5-turbo) — optional, requires API key
- **Google Gemini** (gemini-2.0-flash, gemini-1.5-pro) — optional, requires API key
- Live provider selector — switch from the settings panel

### Plugin System
- Register plugins at runtime with `activate` / `deactivate` lifecycle hooks
- Dynamic plugin loader — drop a compiled `.js` file, no rebuild needed
- Plugin store with enable/disable toggles persisted across sessions
- Full access to the message send / receive API

### Enhanced Tools
- Six built-in tools: `read_file`, `write_file`, `list_directory`, `run_command`, `browse_url`, `search_web`
- Central `ToolRegistry` — register, introspect, and execute additional tools by name
- **Runtime input validation** against each tool's JSON schema before execution
- Destructive tools (`write_file`, `run_command`) require explicit modal confirmation

### Notifications
- In-app toast system with `info`, `success`, `warning`, and `error` levels
- `NotificationService` IPC — send notifications from the main process, displayed instantly in the renderer
- Unread badge and notification center

### UI & Themes
- Five built-in themes: **Dark**, **Light**, **Solarized**, **Nord**, **Dracula** — selectable from settings
- Collapsible sidebar, modal system, and tooltip singleton
- Input autocomplete with async suggestion support
- Scroll controls FAB with auto-scroll and unread message badge
- In-conversation message search with text highlighting and result count
- Keyboard shortcuts overlay listing every available shortcut

### Error Handling
- Global `window.onerror` and `unhandledrejection` interceptors in the renderer
- User-facing toast notifications for recoverable errors
- Typed `AppError` / `NetworkError` / `AuthError` hierarchy in the main process
- Middleware wrapper for async IPC handlers with automatic error reporting

### Security
- `script-src 'self'` CSP — no inline scripts anywhere in the renderer
- HTML and path sanitization utilities against XSS and path traversal
- Terminal commands require explicit modal confirmation
- No external telemetry — all data stays on-device
- API keys stored via `SecureStorageService`

### Multimodal Input *(experimental)*
- Image attachment support via drag-and-drop or file picker
- Automatic File → base64 conversion for vision-capable models
- Preview strip with per-image removal

---

## Architecture

```
jarvis/
├── src/                              # Main process (TypeScript)
│   ├── main.ts                       # Electron entry — wires all services and IPC handlers
│   ├── preload.ts                    # Context bridge — typed IPC surface for the renderer
│   ├── constants.ts
│   ├── errors/                       # AppError hierarchy, reporter, middleware
│   ├── security/                     # sanitizeHTML, sanitizePath
│   ├── providers/                    # AI provider layer
│   │   ├── ProviderRegistry.ts       # Active provider selection
│   │   ├── OllamaProvider.ts         # Default provider
│   │   ├── AnthropicProvider.ts
│   │   ├── OpenAIProvider.ts
│   │   ├── GeminiProvider.ts
│   │   └── …(metrics, fallback, health checker, cost estimator, token counter)
│   ├── services/
│   │   ├── ClaudeService.ts          # Agent loop — Ollama streaming, tool dispatch, history
│   │   ├── ConfigService.ts          # Typed settings with file persistence
│   │   ├── WindowStateService.ts     # Window size/position persistence
│   │   ├── BrowserService.ts         # Headless Chrome + HTTP fallback
│   │   ├── FileSystemService.ts
│   │   ├── ShellService.ts
│   │   ├── memory/                   # MemoryStore, MemoryPersistence, search, export
│   │   ├── history/                  # ConversationHistory
│   │   ├── notifications/            # NotificationService
│   │   ├── voice/                    # SpeechProcessor
│   │   └── …(file watcher, crash reporter, secure storage, system info, update checker)
│   ├── plugins/                      # PluginManager, PluginLoader, PluginStore
│   ├── tools/
│   │   ├── toolDefinitions.ts        # Tool schemas in OpenAI/Ollama-compatible format
│   │   ├── toolRegistry.ts           # Enhanced runtime registry
│   │   └── enhanced/                 # ToolRegistry class
│   ├── ipc/                          # Channel constants and typed handlers
│   ├── types/                        # AgentEvent, JarvisConfig, shared interfaces
│   ├── utils/
│   │   ├── dev/logger.ts             # createLogger — namespaced, coloured, timestamped
│   │   ├── tokenUtils.ts             # estimateTokens, truncateToTokenBudget
│   │   └── …(retry, debounce, cache, event bus, formatters, …)
│   ├── tests/                        # node:test unit test suites
│   └── experimental/multimodal/      # ImageInput, base64 conversion
│
├── renderer/                         # Renderer process (vanilla JS + CSS)
│   ├── index.html                    # App shell — no inline scripts
│   ├── app.js                        # All renderer logic
│   ├── styles.css
│   ├── themes/                       # dark.css, light.css, solarized.css, nord.css, dracula.css
│   ├── error-handling/
│   ├── memory/
│   ├── history/
│   ├── notifications/
│   ├── plugins/
│   ├── providers/
│   ├── tools/
│   ├── voice/
│   ├── multimodal/
│   └── ui/
│
├── assets/                           # App icons (png, ico, icns)
├── scripts/                          # Dev and build helper scripts
├── package.json
└── tsconfig.json
```

### IPC Communication Pattern

All communication between the main process and the renderer uses a **typed message-passing** contract via `contextBridge`. Every channel is explicitly declared in `preload.ts`.

```
Renderer                              Main Process
   │  jarvis.sendMessage(text)            │
   │ ──────────────────────────────────▶  │
   │                                      │── ClaudeService.agentLoop()
   │  on('agent:event', { type:'text' })  │     │  Ollama HTTP stream
   │ ◀──────────────────────────────────  │ ◀───┘  (per token)
   │  on('agent:event', { type:'done',    │
   │       inputTokens, outputTokens })   │
   │ ◀──────────────────────────────────  │
```

**Available IPC namespaces exposed on `window.jarvis`:**

| Namespace | Methods |
|---|---|
| *(root)* | `sendMessage`, `clearHistory`, `confirmAction`, `onAgentEvent`, `getConfig`, `saveConfig`, `onOpenSettings`, `openExternal` |
| `memory` | `set`, `get`, `delete`, `all` |
| `history` | `create`, `all`, `delete`, `addMessage` |
| `notifications` | `send`, `all`, `unread`, `markRead`, `onNew` |

---

## Requirements

| Dependency | Version |
|---|---|
| Node.js | 18 or higher |
| npm | 9 or higher |
| Ollama | Latest — [ollama.com/download](https://ollama.com/download) |
| Chrome / Edge / Chromium | Optional — enables `browse_url` and `search_web` tools |

Optional: API keys for Anthropic, OpenAI, or Google Gemini if you want to use those providers.

---

## Installation

### Run from source

```bash
git clone https://github.com/JuanVictorFY/Jarvis.git
cd Jarvis
npm install

# Start Ollama in a separate terminal
ollama serve
ollama pull llama3.2

# Run Jarvis
npm run dev
```

### Build a distributable

```bash
npm run build
```

Outputs an NSIS installer (Windows) or DMG (macOS) in `dist/`.

---

## Configuration

Settings are accessible from the **⚙ Settings** panel inside the app and are stored locally in `~/.config/Jarvis/jarvis-config.json`.

| Setting | Default | Description |
|---|---|---|
| `ollamaBaseUrl` | `http://localhost:11434` | Ollama server URL |
| `model` | `llama3.2` | Model to use (must be pulled via `ollama pull <model>`) |
| `maxTokens` | `8192` | Max tokens per response |
| `defaultProvider` | `ollama` | Active provider on startup |
| `theme` | `dark` | UI theme — `dark`, `light`, `solarized`, `nord`, `dracula` |
| `anthropicApiKey` | `""` | Optional — only needed if switching to Claude |
| `openaiApiKey` | `""` | Optional — only needed if switching to OpenAI |
| `geminiApiKey` | `""` | Optional — only needed if switching to Gemini |

---

## Usage

1. **Make sure Ollama is running** — `ollama serve` in a terminal.
2. **Start a conversation** — type in the chat input and press `Enter`.
3. **Watch it stream** — response text appears token by token.
4. **Check token usage** — the header shows `in X · out Y` updated after every response.
5. **Run code** — shell blocks have a **▶ Run** button; Jarvis asks for confirmation before executing.
6. **Switch models** — open Settings (`⚙`) and change the Model field (the model must be pulled first).
7. **Persist context** — use `window.jarvis.memory.set(key, value)` or the memory panel to save facts across sessions.
8. **Search the conversation** — press `Ctrl+F` to highlight and navigate matches.
9. **Use voice** — click the microphone or press `Ctrl+Shift+V`.
10. **Manage plugins** — enable / disable from the plugin panel (`Ctrl+P`).

---

## AI Providers

| Provider | Default | Models | Tool calling | Notes |
|---|---|---|---|---|
| **Ollama (local)** | ✅ | llama3.2, llama3.1, mistral, qwen2.5, … | model-dependent | Free, no API key, runs offline |
| Anthropic Claude | — | claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5 | ✅ | Optional, paid |
| OpenAI | — | gpt-4o, gpt-4-turbo, gpt-3.5-turbo | ✅ | Optional, paid |
| Google Gemini | — | gemini-2.0-flash, gemini-1.5-pro | ✅ | Optional, paid |

---

## Plugin System

```ts
// my-plugin.ts
import type { Plugin, PluginAPI } from './src/plugins';

const myPlugin: Plugin = {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  activate(api: PluginAPI) {
    api.onMessage((msg) => {
      if (msg.includes('hello')) api.sendMessage('Hello from my plugin!');
    });
  },
  deactivate() {},
};

export default myPlugin;
```

Compile the file and drop it in `plugins/` — enable it from the plugin panel with no restart required.

---

## Voice Input

Voice input uses Chromium's built-in **Web Speech API**. For environments without native speech support, `VoiceFallbackService` is available.

- Continuous mode with automatic punctuation
- Interim results displayed as ghost text while speaking
- Real-time frequency-bar visualizer via Web Audio API
- Configurable silence detection timeout
- Session recording with timestamp log

---

## Memory System

The memory system is a schema-free key-value store that persists to disk as JSON. It is restored automatically on startup.

```js
// Renderer — via window.jarvis.memory
await jarvis.memory.set('project', { name: 'Jarvis', version: '0.2.0' });
const data  = await jarvis.memory.get('project');
const all   = await jarvis.memory.all();
await jarvis.memory.delete('project');
```

Data is written to `~/.config/Jarvis/memory.json` after every mutation and on app exit.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Enter` | Send message |
| `Shift+Enter` | Insert newline |
| `Ctrl+Shift+J` | Toggle app window (global) |
| `Ctrl+F` | Search in conversation |
| `Ctrl+M` | Open memory panel |
| `Ctrl+P` | Open plugin panel |
| `Ctrl+Shift+V` | Toggle voice input |
| `Ctrl+/` | Toggle keyboard shortcuts overlay |
| `Ctrl+,` | Open settings |
| `Ctrl+L` | Clear conversation |
| `Escape` | Close active panel / modal |

---

## Security

- **`script-src 'self'`** — all renderer JavaScript lives in `app.js`; `unsafe-inline` has been removed from the Content Security Policy.
- **HTML sanitization** — user-supplied and AI-generated content is sanitized via `escHtml()` before DOM injection to prevent XSS.
- **Path sanitization** — file paths from tool calls are sanitized to prevent path traversal attacks.
- **Terminal confirmation** — `run_command` and `write_file` always present a modal requiring explicit user approval before execution.
- **Local-only storage** — no external telemetry. All data (memory, history, settings, window state) is stored on-device only.
- **Secure credential storage** — API keys are handled by `SecureStorageService` and never stored in plain text.
- **IPC surface minimised** — `contextBridge` exposes only explicitly declared methods; `nodeIntegration` is disabled.

---

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode — recompiles on every save
npm run watch

# Start the app (compiles first)
npm run dev

# Run unit tests
npm test

# Build distributable installer / DMG
npm run build
```

### TypeScript configuration

```json
{
  "strict": true,
  "noImplicitAny": true,
  "noImplicitReturns": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

### Adding a new AI provider

1. Create `src/providers/MyProvider.ts` implementing `AIProvider`.
2. Register it in `src/providers/ProviderFactory.ts`.
3. Add its models to `src/providers/ProviderCapabilities.ts`.
4. Add API key field to `JarvisConfig` in `src/types/index.ts` and the settings panel in `renderer/index.html`.

### Adding a new tool

1. Add the tool definition to `src/tools/toolDefinitions.ts` using the `OllamaTool` interface (OpenAI-compatible format).
2. Add its name to the `ToolName` union type.
3. Handle it in `ClaudeService.executeTool()`.

---

## Testing

Tests use Node.js's built-in `node:test` runner — no additional dependencies required.

```bash
npm test
```

| Suite | Covers |
|---|---|
| `tokenUtils.test.ts` | `estimateTokens`, `truncateToTokenBudget`, `extractSignatures` |
| `memoryStore.test.ts` | `MemoryStore` CRUD, id stability, complex values |
| `notificationService.test.ts` | send, read, unread filter, listener subscribe/unsubscribe |
| `conversationHistory.test.ts` | create, addMessage, sort order, delete, error on bad id |

---

## Roadmap

- [ ] Diff view before applying AI-suggested code changes
- [ ] Multi-file workspace context (include related files automatically)
- [ ] Custom system prompt editor per conversation
- [ ] Marketplace for community plugins
- [ ] Linux build target (AppImage / .deb)
- [ ] MCP (Model Context Protocol) server integration
- [ ] RAG over local codebase with vector embeddings
- [ ] Streaming tool results (progress updates during long-running commands)
- [ ] Auto-detect installed Ollama models and populate the model selector dynamically

---

## License

MIT © [JuanVictorFY](https://github.com/JuanVictorFY)
