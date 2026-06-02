# Jarvis — Autonomous AI Desktop Agent

> A production-grade, cross-platform desktop application that puts a fully autonomous AI coding agent on your machine — powered by Claude and built on Electron.

<p align="center">
  <img src="assets/icon.png" width="96" alt="Jarvis logo" />
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-0.2.0-blueviolet?style=flat-square" />
  <img alt="Electron" src="https://img.shields.io/badge/Electron-33-47848F?style=flat-square&logo=electron" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript" />
  <img alt="Claude" src="https://img.shields.io/badge/Claude-Anthropic-D97757?style=flat-square" />
  <img alt="Platform" src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey?style=flat-square" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-22c55e?style=flat-square" />
  <img alt="Tests" src="https://img.shields.io/badge/tests-node%3Atest-brightgreen?style=flat-square" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [What's New](#whats-new)
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

Jarvis is a standalone desktop agent that combines a rich streaming chat interface with deep tool integrations, a persistent memory store, multi-provider AI support, and an extensible plugin architecture. It is designed as a foundation for building serious AI-powered developer tooling — not a toy prototype.

Key design principles:

- **Streaming-first** — every response renders token by token using `messages.stream()`; the UI never blocks waiting for a complete response.
- **Cost-aware** — Anthropic prompt caching is applied to the system prompt and tool definitions on every call, reducing input token costs by up to 90% on repeated interactions.
- **Provider-agnostic** — swap between Anthropic Claude, OpenAI, Google Gemini, and local Ollama models without touching your workflow.
- **Extensible by design** — the plugin system lets you add custom tools, UI panels, and message hooks at runtime.
- **Resilient** — agent loops have a 5-minute IPC timeout, token-aware history trimming prevents context overflow, and every tool input is validated before execution.
- **Offline-capable** — memory, history, settings, and window state persist locally; only AI inference requires a network connection.

---

## What's New

### Latest improvements

| Area | Change |
|---|---|
| **Streaming** | Switched to `client.messages.stream()` — text now renders token by token instead of arriving all at once |
| **Prompt caching** | `cache_control: { type: 'ephemeral' }` applied to system prompt and tool definitions — up to 90% cost reduction on repeated calls |
| **History management** | Token-aware trimming with an 80k-token budget replaces the old fixed-count approach |
| **Tool validation** | Required fields from each tool's JSON schema are validated before execution — no more cryptic runtime errors |
| **Token stats** | Real `input_tokens` / `output_tokens` from each API response accumulate in the header bar |
| **IPC timeout** | Agent loops auto-cancel after 5 minutes and surface a clear error message |
| **Window state** | Size, position, and maximized state persist across restarts via `WindowStateService` |
| **Memory IPC** | `MemoryStore` + `MemoryPersistence` fully wired — memory survives app restarts and is accessible from the renderer |
| **History IPC** | `ConversationHistory` exposed via IPC — create, list, delete, and add messages from the renderer |
| **Notifications IPC** | `NotificationService` wired — toasts fire in the renderer whenever a notification is sent from any process |
| **Settings panel** | Now includes OpenAI, Gemini, Ollama, default provider, and theme fields |
| **CSP hardened** | Removed `unsafe-inline` from `script-src` — all renderer JS lives in `app.js`, loaded as `'self'` |
| **Browser fallback** | `BrowserService` now tries 10 Chrome/Edge/Chromium paths and falls back to plain HTTP when none are found |
| **Structured logger** | `createLogger(namespace)` replaces all `console.log` calls in the main process — coloured, timestamped, namespaced output |
| **Unit tests** | 4 test suites using Node.js built-in `node:test` — no external test runner required |

---

## Features

### AI Chat & Streaming
- True token-by-token streaming via `client.messages.stream()` — text appears as it is generated
- Anthropic **prompt caching** on system prompt and tool definitions — costs drop dramatically on long sessions
- Full Markdown rendering with syntax-highlighted code blocks
- **Live token counter** in the header: session input and output tokens updated after every response
- 5-minute agent timeout with user-visible error message
- Graceful error surfaces — failures appear inline, never silently swallowed

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
- **Anthropic Claude** (Opus 4.8, Sonnet 4.6, Haiku 4.5) — default provider
- **OpenAI** (GPT-4o, GPT-4-turbo, GPT-3.5-turbo)
- **Google Gemini** (gemini-1.5-pro, gemini-1.5-flash)
- **Ollama** — any locally running model via `http://localhost:11434`
- Provider health checker, automatic fallback, and per-provider usage metrics
- Live provider selector — switch mid-session from the settings panel

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
│   │   ├── AnthropicProvider.ts
│   │   ├── OpenAIProvider.ts
│   │   ├── GeminiProvider.ts
│   │   ├── OllamaProvider.ts
│   │   └── …(metrics, fallback, health checker, cost estimator, token counter)
│   ├── services/
│   │   ├── ClaudeService.ts          # Agent loop — streaming, caching, history, tool dispatch
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
│   │   ├── toolDefinitions.ts        # Tool schemas + TOOLS_WITH_CACHE
│   │   ├── toolRegistry.ts           # Enhanced runtime registry
│   │   └── enhanced/                 # ToolRegistry class
│   ├── ipc/                          # Channel constants and typed handlers
│   ├── types/                        # AgentEvent, JarvisConfig, shared interfaces
│   ├── utils/
│   │   ├── dev/logger.ts             # createLogger — namespaced, coloured, timestamped
│   │   ├── tokenUtils.ts             # estimateTokens, truncateToTokenBudget
│   │   └── …(retry, debounce, cache, event bus, formatters, …)
│   ├── tests/                        # node:test unit test suites
│   │   ├── tokenUtils.test.ts
│   │   ├── memoryStore.test.ts
│   │   ├── notificationService.test.ts
│   │   └── conversationHistory.test.ts
│   └── experimental/multimodal/      # ImageInput, base64 conversion
│
├── renderer/                         # Renderer process (vanilla JS + CSS)
│   ├── index.html                    # App shell — no inline scripts
│   ├── app.js                        # All renderer logic (extracted from HTML)
│   ├── styles.css                    # Global styles + token stats + toasts
│   ├── animations.css
│   ├── syntax-highlight.css / .js
│   ├── theme-manager.js
│   ├── themes/                       # dark.css, light.css, solarized.css, nord.css, dracula.css
│   ├── status-bar.js
│   ├── message-search.js
│   ├── scroll-controls.js
│   ├── keyboard-shortcuts-overlay.js
│   ├── welcome-screen.js
│   ├── error-handling/               # ErrorBoundary, ErrorToast, ErrorLogViewer
│   ├── memory/                       # MemoryPanel, MemorySearchUI
│   ├── history/                      # HistorySidebar
│   ├── notifications/                # NotificationCenter, NotificationBadge
│   ├── plugins/                      # PluginList
│   ├── providers/                    # ProviderSelector
│   ├── tools/                        # ToolSelector
│   ├── voice/                        # VoiceInput, VoiceVisualizer
│   ├── multimodal/                   # ImagePreview
│   └── ui/                           # ThemeSwitcher, Sidebar, Modal, Tooltip, Autocomplete
│
├── assets/                           # App icons (png, ico, icns)
├── scripts/                          # Dev and build helper scripts
├── package.json
└── tsconfig.json
```

### IPC Communication Pattern

All communication between the main process and the renderer uses a **typed message-passing** contract via `contextBridge`. Every channel is explicitly declared in `preload.ts` — no `any`, no untyped payloads.

```
Renderer                              Main Process
   │  jarvis.sendMessage(text)            │
   │ ──────────────────────────────────▶  │
   │                                      │── ClaudeService.agentLoop()
   │  on('agent:event', { type:'text' })  │     │  messages.stream()
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
| Anthropic API key | Required for Claude (default provider) |
| Chrome / Edge / Chromium | Optional — enables `browse_url` and `search_web` tools |

Optional: API keys for OpenAI, Google Gemini, or a running Ollama instance.

---

## Installation

### Run from source

```bash
git clone https://github.com/JuanVictorFY/Jarvis.git
cd Jarvis
npm install
npm run dev
```

### Build a distributable

```bash
npm run build
```

Outputs an NSIS installer (Windows) or DMG (macOS) in `dist/`.

---

## Configuration

On first launch Jarvis prompts for your Anthropic API key. All settings are also accessible from the **⚙ Settings** panel inside the app and are stored locally in `~/.config/Jarvis/jarvis-config.json`.

| Setting | Default | Description |
|---|---|---|
| `anthropicApiKey` | `""` | Anthropic API key — required for Claude |
| `model` | `claude-sonnet-4-6` | Claude model to use |
| `maxTokens` | `8192` | Max tokens per response |
| `openaiApiKey` | `""` | OpenAI API key |
| `geminiApiKey` | `""` | Google Gemini API key |
| `ollamaBaseUrl` | `http://localhost:11434` | Ollama server base URL |
| `defaultProvider` | `anthropic` | Active provider on startup |
| `theme` | `dark` | UI theme — `dark`, `light`, `solarized`, `nord`, `dracula` |

---

## Usage

1. **Start a conversation** — type in the chat input and press `Enter`.
2. **Watch it stream** — response text appears token by token as Claude generates it.
3. **Check token usage** — the header shows `in X · out Y` updated after every response.
4. **Run code** — shell blocks have a **▶ Run** button; Jarvis asks for confirmation before executing.
5. **Switch providers** — open Settings (`⚙`) and change the Default Provider; takes effect on the next message.
6. **Persist context** — use `window.jarvis.memory.set(key, value)` or the memory panel to save facts across sessions.
7. **Search the conversation** — press `Ctrl+F` to highlight and navigate matches.
8. **Use voice** — click the microphone or press `Ctrl+Shift+V`.
9. **Manage plugins** — enable / disable from the plugin panel (`Ctrl+P`).

---

## AI Providers

| Provider | Models | Streaming | Vision | Notes |
|---|---|---|---|---|
| Anthropic Claude | claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5 | ✅ | ✅ | Default; prompt caching enabled |
| OpenAI | gpt-4o, gpt-4-turbo, gpt-3.5-turbo | ✅ | ✅ | |
| Google Gemini | gemini-1.5-pro, gemini-1.5-flash | ✅ | ✅ | |
| Ollama (local) | any installed model | ✅ | model-dependent | No API key required |

`ProviderFallback` retries on a secondary provider if the primary fails. `ProviderHealthChecker` runs periodic pings and surfaces degraded status in the status bar.

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
  "noUnusedParameters": true,
  "exactOptionalPropertyTypes": true
}
```

### Adding a new AI provider

1. Create `src/providers/MyProvider.ts` implementing `AIProvider`.
2. Register it in `src/providers/ProviderFactory.ts`.
3. Add its models to `src/providers/ProviderCapabilities.ts`.
4. Add API key field to `JarvisConfig` in `src/types/index.ts` and the settings panel in `renderer/index.html`.

### Adding a new tool

1. Implement the `Tool` interface from `src/tools/enhanced/ToolRegistry.ts`.
2. Add it to `src/tools/toolDefinitions.ts` and the `ToolName` union.
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

---

## License

MIT © [JuanVictorFY](https://github.com/JuanVictorFY)
