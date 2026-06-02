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
</p>

---

## Table of Contents

- [Overview](#overview)
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
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

Jarvis is a standalone desktop agent that combines a rich chat interface with deep tool integrations, a persistent memory store, multi-provider AI support, and an extensible plugin architecture. It is designed as a foundation for building serious AI-powered developer tooling — not a toy prototype.

Key design principles:

- **Streaming-first** — every response renders token by token; the UI never blocks.
- **Provider-agnostic** — swap between Anthropic Claude, OpenAI, Google Gemini, and local Ollama models without touching your workflow.
- **Extensible by design** — the plugin system lets you add custom tools, UI panels, and message hooks at runtime.
- **Offline-capable** — memory, history, and settings persist locally; only AI inference requires a network connection.

---

## Features

### AI Chat & Streaming
- Real-time token-by-token streaming via `@anthropic-ai/sdk`
- Full Markdown rendering with syntax-highlighted code blocks (light + dark)
- Per-session **token counter** and cumulative **cost tracking** displayed in the status bar
- Graceful error surfaces — API failures appear inline, never silently swallowed

### Conversation History
- Persistent conversation store with full CRUD
- Sidebar with title, last-updated timestamp, and one-click deletion
- Auto-title generation from the first user message

### Memory System
- Key-value memory store with UUID-based entries and createdAt / updatedAt timestamps
- File-backed JSON persistence — survives app restarts
- Full-text search across all keys and values
- JSON and CSV export / import
- Live memory panel showing all stored entries

### Voice Input
- Web Speech API integration with continuous mode and interim result display
- Real-time frequency-bar visualizer using the Web Audio API
- Silence detection, noise cancellation config, and session recording
- Fallback service for browsers/environments without native speech support

### Multi-Provider AI
- **Anthropic Claude** (Opus, Sonnet, Haiku) — default provider
- **OpenAI** (GPT-4o, GPT-4-turbo, GPT-3.5-turbo)
- **Google Gemini** (gemini-1.5-pro, gemini-1.5-flash)
- **Ollama** — any locally running model
- Provider health checker, automatic fallback, and per-provider metrics
- Live provider selector in the toolbar — switch mid-conversation

### Plugin System
- Register plugins at runtime with `activate` / `deactivate` lifecycle hooks
- Dynamic plugin loader — drop a `.js` or `.ts` file, no rebuild needed
- Plugin store with enable/disable toggles persisted across sessions
- Full access to the message send / receive API

### Enhanced Tools
- Central `ToolRegistry` — register, introspect, and execute tools by name
- Input schema validation per tool
- Tool selector UI for manual tool invocation

### Notifications
- In-app notification center with `info`, `success`, `warning`, and `error` levels
- Unread badge with 99+ cap
- Listener-based subscription API for programmatic notifications

### UI & Themes
- Five built-in themes: **Dark**, **Light**, **Solarized**, **Nord**, **Dracula**
- Theme preference persisted in `localStorage`
- Collapsible sidebar, modal system, and tooltip singleton
- Input autocomplete with async suggestion support
- Scroll controls FAB with auto-scroll and unread message badge
- Message search with text highlighting, previous/next navigation, and result count
- Keyboard shortcuts overlay (`Ctrl+/`) listing every available shortcut

### Error Handling
- Global `window.onerror` and `unhandledrejection` interceptors
- User-facing toast notifications for recoverable errors
- Scrollable error log viewer with timestamp and level
- Typed `AppError` / `NetworkError` / `AuthError` hierarchy in the main process
- Middleware wrapper for async handlers with automatic error reporting

### Security
- HTML and path sanitization utilities against XSS and path traversal
- Content Security Policy enforced on all renderer windows
- Terminal commands require explicit modal confirmation before execution
- No external telemetry — all data stays on your machine

### Multimodal Input *(experimental)*
- Image attachment support: drag-and-drop or file picker
- Automatic File → base64 conversion for vision-capable models
- Preview strip with per-image removal

---

## Architecture

```
jarvis/
├── src/                          # Main process (TypeScript)
│   ├── main.ts                   # Electron entry point
│   ├── preload.ts                # Context bridge — typed IPC surface
│   ├── constants.ts              # App-wide constants
│   ├── errors.ts                 # Top-level error types
│   ├── errors/                   # AppError hierarchy + reporter + middleware
│   ├── security/                 # sanitizeHTML, sanitizePath
│   ├── providers/                # AI provider implementations + registry
│   │   ├── ProviderRegistry.ts
│   │   ├── AnthropicProvider.ts
│   │   ├── OpenAIProvider.ts
│   │   ├── GeminiProvider.ts
│   │   ├── OllamaProvider.ts
│   │   └── …(metrics, fallback, health, cache, token counter)
│   ├── services/                 # Business logic services
│   │   ├── memory/               # MemoryStore, MemoryPersistence, search, export
│   │   ├── history/              # ConversationHistory
│   │   ├── notifications/        # NotificationService
│   │   ├── voice/                # SpeechProcessor
│   │   ├── ThemeService.ts
│   │   ├── VoiceService.ts
│   │   ├── UpdateCheckerService.ts
│   │   └── …(file watcher, crash reporter, secure storage, system info)
│   ├── plugins/                  # PluginManager, PluginLoader, PluginStore
│   ├── tools/                    # ToolRegistry + enhanced tool definitions
│   ├── ipc/                      # IPC channel definitions and handlers
│   ├── types/                    # Shared TypeScript types (config, agent, IPC)
│   ├── utils/                    # Pure utilities (logger, retry, debounce, …)
│   └── experimental/
│       └── multimodal/           # ImageInput, base64 conversion
│
├── renderer/                     # Renderer process (vanilla JS + CSS)
│   ├── index.html                # App shell
│   ├── styles.css                # Global styles
│   ├── animations.css            # Keyframe animations
│   ├── syntax-highlight.css      # Code block theme variables
│   ├── syntax-highlight.js       # Runtime syntax highlighter
│   ├── theme-manager.js          # CSS variable injection per theme
│   ├── themes/                   # dark.css, light.css, …
│   ├── status-bar.js             # Connection • model • token display
│   ├── message-search.js         # In-conversation search
│   ├── scroll-controls.js        # Auto-scroll FAB + unread badge
│   ├── keyboard-shortcuts-overlay.js
│   ├── welcome-screen.js
│   ├── error-handling/           # ErrorBoundary, ErrorToast, ErrorLogViewer
│   ├── memory/                   # MemoryPanel, MemorySearchUI
│   ├── history/                  # HistorySidebar
│   ├── notifications/            # NotificationCenter, NotificationBadge
│   ├── plugins/                  # PluginList
│   ├── providers/                # ProviderSelector
│   ├── tools/                    # ToolSelector
│   ├── voice/                    # VoiceInput, VoiceVisualizer
│   ├── multimodal/               # ImagePreview
│   └── ui/                       # ThemeSwitcher, Sidebar, Modal, Tooltip, Autocomplete
│
├── assets/                       # App icons (png, ico, icns)
├── scripts/                      # Build and dev scripts
├── package.json
└── tsconfig.json
```

### IPC Communication Pattern

All communication between the main process and the renderer follows a **typed message-passing** contract via `contextBridge`. No `any`, no untyped payloads.

```
Renderer                            Main Process
   │  invoke('chat:send', payload)      │
   │ ─────────────────────────────────▶ │
   │                                    │── Provider.stream()
   │  on('chat:chunk', token)           │        │
   │ ◀─────────────────────────────────│◀───────┘
   │  on('chat:done', stats)            │
   │ ◀─────────────────────────────────│
```

---

## Requirements

| Dependency | Version |
|---|---|
| Node.js | 18 or higher |
| npm | 9 or higher |
| Anthropic API key | Required for Claude (default provider) |

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

On first launch Jarvis will prompt for your Anthropic API key. You can also set it — and all other options — via the **Settings** panel inside the app.

| Key | Default | Description |
|---|---|---|
| `anthropicApiKey` | `""` | Anthropic API key (required for Claude) |
| `openaiApiKey` | `""` | OpenAI API key |
| `geminiApiKey` | `""` | Google Gemini API key |
| `ollamaBaseUrl` | `http://localhost:11434` | Ollama server URL |
| `defaultProvider` | `anthropic` | Active AI provider on startup |
| `defaultModel` | `claude-sonnet-4-6` | Default model for the active provider |
| `maxTokens` | `8192` | Maximum tokens per response |
| `theme` | `dark` | UI theme (`dark` \| `light` \| `solarized` \| `nord` \| `dracula`) |
| `memoryPersistPath` | `~/.jarvis/memory.json` | Path for memory store persistence |

---

## Usage

1. **Start a conversation** — type in the chat input and press `Enter`.
2. **Switch providers** — use the provider dropdown in the toolbar; the switch takes effect on the next message.
3. **Apply code** — every code block in the response has a one-click **Copy** button; shell blocks have an additional **Run** button that requires confirmation.
4. **Save context to memory** — use the memory panel (`Ctrl+M`) to store key facts that persist across sessions.
5. **Search history** — press `Ctrl+F` to search within the current conversation.
6. **Use voice** — click the microphone button or press `Ctrl+Shift+V` to start voice input.
7. **Manage plugins** — open the plugin panel (`Ctrl+P`) to enable, disable, or load new plugins.

---

## AI Providers

| Provider | Models | Streaming | Vision |
|---|---|---|---|
| Anthropic Claude | claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5 | ✅ | ✅ |
| OpenAI | gpt-4o, gpt-4-turbo, gpt-3.5-turbo | ✅ | ✅ |
| Google Gemini | gemini-1.5-pro, gemini-1.5-flash | ✅ | ✅ |
| Ollama (local) | any installed model | ✅ | model-dependent |

The `ProviderFallback` service automatically retries on a secondary provider if the primary fails. The `ProviderHealthChecker` runs periodic pings and surfaces degraded status in the status bar.

---

## Plugin System

```ts
// example-plugin.ts
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

Drop the compiled file into `plugins/` and enable it from the plugin panel — no restart required.

---

## Voice Input

Voice input uses the browser's **Web Speech API** (Chromium, bundled with Electron). For environments without native speech support, a `VoiceFallbackService` is available.

Supported features:
- Continuous mode with automatic punctuation
- Interim results displayed as ghost text while speaking
- Real-time frequency visualizer (Web Audio API)
- Configurable silence detection timeout
- Session recording with timestamp log

---

## Memory System

The memory system is a lightweight, schema-free key-value store that persists to disk as JSON.

```ts
// Programmatic access via IPC
await window.jarvis.memory.set('user-preferences', { theme: 'nord' });
const prefs = await window.jarvis.memory.get('user-preferences');
const results = await window.jarvis.memory.search('theme');
```

Exports are available in JSON and CSV format from the memory panel UI.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Enter` | Send message |
| `Shift+Enter` | Insert newline |
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

- **HTML sanitization** — all user-supplied and AI-generated content is sanitized before DOM injection to prevent XSS.
- **Path sanitization** — file paths from tool calls are sanitized to prevent path traversal.
- **Content Security Policy** — enforced on all renderer windows; no inline scripts, no external resources.
- **Terminal confirmation** — shell commands are never executed automatically; a modal presents the full command and requires explicit user approval.
- **Local-only storage** — no telemetry, no crash reporting to external services. All data (memory, history, settings) is stored on-device.
- **Secure credential storage** — API keys are stored via `SecureStorageService`, not in plain text config files.

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

# Build distributable
npm run build
```

### TypeScript

The project uses strict TypeScript throughout:

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

1. Create `src/providers/MyProvider.ts` implementing the `AIProvider` interface.
2. Register it in `src/providers/ProviderFactory.ts`.
3. Add its models to `src/providers/ProviderCapabilities.ts`.
4. Optionally add a settings entry in `src/types/config.ts`.

### Adding a new tool

1. Create a class implementing `Tool` from `src/tools/enhanced/ToolRegistry.ts`.
2. Call `registry.register(myTool)` in `src/main.ts` (or a plugin's `activate`).

---

## Roadmap

- [ ] Diff view before applying AI-suggested code changes
- [ ] Multi-file workspace context (send multiple files in one prompt)
- [ ] Agent mode — autonomous multi-step task execution with tool use
- [ ] Custom system prompt editor per conversation
- [ ] Marketplace for community plugins
- [ ] Linux build target
- [ ] MCP (Model Context Protocol) server integration
- [ ] RAG over local codebase with vector embeddings

---

## License

MIT © [JuanVictorFY](https://github.com/JuanVictorFY)
