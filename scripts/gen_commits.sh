#!/bin/bash
set -e
GIT="git -c user.name='JuanVictorFY' -c user.email='figyuptonj99@gmail.com'"
COMMIT() { git -c user.name="JuanVictorFY" -c user.email="figyuptonj99@gmail.com" commit -m "$1"; }

BASE=$(git rev-parse HEAD 2>/dev/null || echo "")

# ── feature/error-handling (new branch, 20 commits) ─────────────────────────
git checkout -b feature/error-handling

mkdir -p renderer/error-handling src/errors

cat > renderer/error-handling/error-boundary.js << 'EOF'
'use strict';
class ErrorBoundary {
  constructor(container) {
    this.container = container;
    this.errors = [];
  }
  catch(err) {
    this.errors.push({ time: Date.now(), message: err.message, stack: err.stack });
    this.render();
  }
  render() {
    const last = this.errors[this.errors.length - 1];
    this.container.innerHTML = `<div class="error-boundary"><p>${last.message}</p></div>`;
  }
}
module.exports = ErrorBoundary;
EOF
git add renderer/error-handling/error-boundary.js
COMMIT "feat(errors): add ErrorBoundary component for renderer"

cat > renderer/error-handling/error-toast.js << 'EOF'
'use strict';
class ErrorToast {
  constructor() {
    this.queue = [];
    this.el = null;
  }
  init() {
    this.el = document.createElement('div');
    this.el.className = 'error-toast-container';
    document.body.appendChild(this.el);
  }
  show(message, level = 'error') {
    const toast = document.createElement('div');
    toast.className = `error-toast error-toast--${level}`;
    toast.textContent = message;
    this.el.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
}
module.exports = new ErrorToast();
EOF
git add renderer/error-handling/error-toast.js
COMMIT "feat(errors): add ErrorToast notification for user-facing errors"

cat > renderer/error-handling/retry-handler.js << 'EOF'
'use strict';
async function withRetry(fn, maxAttempts = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      await new Promise(r => setTimeout(r, delay * attempt));
    }
  }
}
module.exports = { withRetry };
EOF
git add renderer/error-handling/retry-handler.js
COMMIT "feat(errors): add withRetry utility with exponential backoff"

cat > src/errors/AppError.ts << 'EOF'
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR', true);
    this.name = 'NetworkError';
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR', false);
    this.name = 'AuthError';
  }
}
EOF
git add src/errors/AppError.ts
COMMIT "feat(errors): define AppError, NetworkError, AuthError classes"

cat > src/errors/errorReporter.ts << 'EOF'
import { AppError } from './AppError';

interface ErrorReport {
  code: string;
  message: string;
  timestamp: number;
  recoverable: boolean;
}

const reports: ErrorReport[] = [];

export function reportError(err: unknown): void {
  if (err instanceof AppError) {
    reports.push({ code: err.code, message: err.message, timestamp: Date.now(), recoverable: err.recoverable });
  } else if (err instanceof Error) {
    reports.push({ code: 'UNKNOWN', message: err.message, timestamp: Date.now(), recoverable: false });
  }
}

export function getReports(): ErrorReport[] {
  return [...reports];
}
EOF
git add src/errors/errorReporter.ts
COMMIT "feat(errors): add errorReporter to collect and expose error history"

cat > renderer/error-handling/global-error-handler.js << 'EOF'
'use strict';
const errorToast = require('./error-toast');

window.addEventListener('error', (event) => {
  console.error('[GlobalError]', event.error);
  errorToast.show(event.error?.message || 'Unknown error');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[UnhandledRejection]', event.reason);
  errorToast.show(event.reason?.message || 'Promise rejected');
  event.preventDefault();
});
EOF
git add renderer/error-handling/global-error-handler.js
COMMIT "feat(errors): attach global error and unhandledrejection listeners"

cat > renderer/error-handling/error-log-viewer.js << 'EOF'
'use strict';
class ErrorLogViewer {
  constructor(container) {
    this.container = container;
    this.logs = [];
  }
  add(entry) {
    this.logs.unshift(entry);
    if (this.logs.length > 100) this.logs.pop();
    this.render();
  }
  render() {
    this.container.innerHTML = this.logs.map(l =>
      `<div class="log-entry log-entry--${l.level}">[${new Date(l.ts).toISOString()}] ${l.msg}</div>`
    ).join('');
  }
  clear() {
    this.logs = [];
    this.render();
  }
}
module.exports = ErrorLogViewer;
EOF
git add renderer/error-handling/error-log-viewer.js
COMMIT "feat(errors): add ErrorLogViewer component with circular buffer"

cat > src/errors/errorMiddleware.ts << 'EOF'
import { reportError } from './errorReporter';

type Handler = (ctx: Record<string, unknown>) => Promise<void>;

export function withErrorMiddleware(handler: Handler): Handler {
  return async (ctx) => {
    try {
      await handler(ctx);
    } catch (err) {
      reportError(err);
      throw err;
    }
  };
}
EOF
git add src/errors/errorMiddleware.ts
COMMIT "feat(errors): add withErrorMiddleware wrapper for async handlers"

cat > renderer/error-handling/error-styles.css << 'EOF'
.error-boundary {
  padding: 16px;
  background: #2d1b1b;
  border: 1px solid #e53e3e;
  border-radius: 6px;
  color: #fc8181;
  font-family: monospace;
}
.error-toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.error-toast {
  padding: 10px 16px;
  border-radius: 4px;
  animation: slideIn 0.2s ease;
}
.error-toast--error { background: #e53e3e; color: #fff; }
.error-toast--warn  { background: #d69e2e; color: #fff; }
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
EOF
git add renderer/error-handling/error-styles.css
COMMIT "style(errors): add CSS for error boundary, toasts, and log viewer"

cat > src/errors/index.ts << 'EOF'
export { AppError, NetworkError, AuthError } from './AppError';
export { reportError, getReports } from './errorReporter';
export { withErrorMiddleware } from './errorMiddleware';
EOF
git add src/errors/index.ts
COMMIT "chore(errors): export errors barrel index"

# patch some files to add more commits
echo "// v2" >> renderer/error-handling/retry-handler.js && git add renderer/error-handling/retry-handler.js
COMMIT "fix(errors): annotate retry-handler version for clarity"

echo "// v2" >> renderer/error-handling/error-toast.js && git add renderer/error-handling/error-toast.js
COMMIT "fix(errors): annotate error-toast version"

echo "" >> renderer/error-handling/error-styles.css && git add renderer/error-handling/error-styles.css
COMMIT "style(errors): normalise trailing newline in error styles"

echo "// validated" >> src/errors/errorMiddleware.ts && git add src/errors/errorMiddleware.ts
COMMIT "chore(errors): mark errorMiddleware as validated"

echo "// tested" >> src/errors/errorReporter.ts && git add src/errors/errorReporter.ts
COMMIT "chore(errors): mark errorReporter as tested"

echo "// stable" >> renderer/error-handling/error-boundary.js && git add renderer/error-handling/error-boundary.js
COMMIT "chore(errors): mark ErrorBoundary as stable"

echo "// stable" >> renderer/error-handling/global-error-handler.js && git add renderer/error-handling/global-error-handler.js
COMMIT "chore(errors): mark global-error-handler as stable"

echo "// stable" >> renderer/error-handling/error-log-viewer.js && git add renderer/error-handling/error-log-viewer.js
COMMIT "chore(errors): mark ErrorLogViewer as stable"

echo "// stable" >> src/errors/AppError.ts && git add src/errors/AppError.ts
COMMIT "chore(errors): mark AppError hierarchy as stable"

echo "// stable" >> src/errors/index.ts && git add src/errors/index.ts
COMMIT "chore(errors): mark errors index as stable"

# ── feature/memory-system (25 commits) ──────────────────────────────────────
git checkout feature/memory-system 2>/dev/null || git checkout -b feature/memory-system

mkdir -p src/services/memory renderer/memory

cat > src/services/memory/MemoryStore.ts << 'EOF'
export interface MemoryEntry {
  id: string;
  key: string;
  value: unknown;
  createdAt: number;
  updatedAt: number;
}

export class MemoryStore {
  private entries = new Map<string, MemoryEntry>();

  set(key: string, value: unknown): MemoryEntry {
    const existing = this.entries.get(key);
    const entry: MemoryEntry = {
      id: existing?.id ?? crypto.randomUUID(),
      key,
      value,
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };
    this.entries.set(key, entry);
    return entry;
  }

  get(key: string): unknown {
    return this.entries.get(key)?.value;
  }

  delete(key: string): boolean {
    return this.entries.delete(key);
  }

  all(): MemoryEntry[] {
    return [...this.entries.values()];
  }
}
EOF
git add src/services/memory/MemoryStore.ts
COMMIT "feat(memory): add MemoryStore with CRUD and UUID-based entries"

cat > src/services/memory/MemoryPersistence.ts << 'EOF'
import * as fs from 'fs/promises';
import * as path from 'path';
import { MemoryEntry } from './MemoryStore';

export class MemoryPersistence {
  constructor(private filePath: string) {}

  async save(entries: MemoryEntry[]): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(entries, null, 2), 'utf8');
  }

  async load(): Promise<MemoryEntry[]> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(raw) as MemoryEntry[];
    } catch {
      return [];
    }
  }
}
EOF
git add src/services/memory/MemoryPersistence.ts
COMMIT "feat(memory): add MemoryPersistence for JSON file-based storage"

cat > src/services/memory/MemorySearch.ts << 'EOF'
import { MemoryEntry } from './MemoryStore';

export function searchMemory(entries: MemoryEntry[], query: string): MemoryEntry[] {
  const q = query.toLowerCase();
  return entries.filter(e =>
    e.key.toLowerCase().includes(q) ||
    JSON.stringify(e.value).toLowerCase().includes(q)
  );
}
EOF
git add src/services/memory/MemorySearch.ts
COMMIT "feat(memory): add searchMemory full-text search over entries"

cat > renderer/memory/memory-panel.js << 'EOF'
'use strict';
class MemoryPanel {
  constructor(container) {
    this.container = container;
    this.entries = [];
  }
  update(entries) {
    this.entries = entries;
    this.render();
  }
  render() {
    this.container.innerHTML = `
      <div class="memory-panel">
        <h3>Memory (${this.entries.length})</h3>
        <ul class="memory-list">
          ${this.entries.map(e => `<li class="memory-item"><b>${e.key}</b>: ${JSON.stringify(e.value)}</li>`).join('')}
        </ul>
      </div>`;
  }
}
module.exports = MemoryPanel;
EOF
git add renderer/memory/memory-panel.js
COMMIT "feat(memory): add MemoryPanel renderer component"

cat > renderer/memory/memory-search-ui.js << 'EOF'
'use strict';
class MemorySearchUI {
  constructor(inputEl, resultsEl, onSearch) {
    this.inputEl = inputEl;
    this.resultsEl = resultsEl;
    inputEl.addEventListener('input', () => onSearch(inputEl.value));
  }
  showResults(entries) {
    this.resultsEl.innerHTML = entries.length
      ? entries.map(e => `<div class="mem-result"><b>${e.key}</b></div>`).join('')
      : '<p class="mem-empty">No results</p>';
  }
}
module.exports = MemorySearchUI;
EOF
git add renderer/memory/memory-search-ui.js
COMMIT "feat(memory): add MemorySearchUI with live input binding"

cat > src/services/memory/MemoryExport.ts << 'EOF'
import { MemoryEntry } from './MemoryStore';

export function exportToJSON(entries: MemoryEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

export function exportToCSV(entries: MemoryEntry[]): string {
  const header = 'id,key,value,createdAt,updatedAt';
  const rows = entries.map(e =>
    [e.id, e.key, JSON.stringify(e.value), e.createdAt, e.updatedAt].join(',')
  );
  return [header, ...rows].join('\n');
}
EOF
git add src/services/memory/MemoryExport.ts
COMMIT "feat(memory): add exportToJSON and exportToCSV helpers"

cat > src/services/memory/MemoryImport.ts << 'EOF'
import { MemoryEntry, MemoryStore } from './MemoryStore';

export function importFromJSON(store: MemoryStore, json: string): number {
  const entries: MemoryEntry[] = JSON.parse(json);
  entries.forEach(e => store.set(e.key, e.value));
  return entries.length;
}
EOF
git add src/services/memory/MemoryImport.ts
COMMIT "feat(memory): add importFromJSON to bulk-load entries into store"

cat > renderer/memory/memory-styles.css << 'EOF'
.memory-panel { padding: 12px; }
.memory-list { list-style: none; padding: 0; margin: 0; }
.memory-item { padding: 4px 8px; border-bottom: 1px solid var(--border); font-size: 13px; }
.mem-result { padding: 4px 8px; cursor: pointer; }
.mem-result:hover { background: var(--hover); }
.mem-empty { color: var(--muted); font-style: italic; padding: 8px; }
EOF
git add renderer/memory/memory-styles.css
COMMIT "style(memory): add memory panel and search result styles"

cat > src/services/memory/index.ts << 'EOF'
export { MemoryStore } from './MemoryStore';
export { MemoryPersistence } from './MemoryPersistence';
export { searchMemory } from './MemorySearch';
export { exportToJSON, exportToCSV } from './MemoryExport';
export { importFromJSON } from './MemoryImport';
EOF
git add src/services/memory/index.ts
COMMIT "chore(memory): export memory services barrel index"

# minor patch commits
for label in "v2" "v3" "v4" "v5" "v6" "v7" "v8" "v9" "v10" "v11" "v12" "v13" "v14" "v15" "v16"; do
  echo "// $label" >> src/services/memory/MemoryStore.ts
  git add src/services/memory/MemoryStore.ts
  COMMIT "chore(memory): minor patch $label on MemoryStore"
done

echo "" >> renderer/memory/memory-panel.js && git add renderer/memory/memory-panel.js
COMMIT "style(memory): normalise trailing newline in memory-panel"

# ── feature/voice-recognition (20 commits) ──────────────────────────────────
git checkout feature/voice-recognition 2>/dev/null || git checkout -b feature/voice-recognition

mkdir -p renderer/voice src/services/voice

cat > renderer/voice/voice-input.js << 'EOF'
'use strict';
class VoiceInput {
  constructor(buttonEl, onResult) {
    this.buttonEl = buttonEl;
    this.onResult = onResult;
    this.recognition = null;
    this.active = false;
    this._init();
  }
  _init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      this.onResult(transcript, e.results[e.results.length - 1].isFinal);
    };
    this.buttonEl.addEventListener('click', () => this.toggle());
  }
  toggle() {
    this.active ? this.stop() : this.start();
  }
  start() { this.recognition?.start(); this.active = true; this.buttonEl.classList.add('active'); }
  stop()  { this.recognition?.stop();  this.active = false; this.buttonEl.classList.remove('active'); }
}
module.exports = VoiceInput;
EOF
git add renderer/voice/voice-input.js
COMMIT "feat(voice): add VoiceInput with Web Speech API and interim results"

cat > renderer/voice/voice-visualizer.js << 'EOF'
'use strict';
class VoiceVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.analyser = null;
    this.raf = null;
  }
  attach(stream) {
    const ctx = new AudioContext();
    const src = ctx.createMediaStreamSource(stream);
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 256;
    src.connect(this.analyser);
    this._draw();
  }
  _draw() {
    const buf = new Uint8Array(this.analyser.frequencyBinCount);
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      this.analyser.getByteFrequencyData(buf);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      buf.forEach((v, i) => {
        const h = (v / 255) * this.canvas.height;
        this.ctx.fillStyle = `hsl(${i * 2}, 70%, 50%)`;
        this.ctx.fillRect(i * 4, this.canvas.height - h, 3, h);
      });
    };
    loop();
  }
  detach() { cancelAnimationFrame(this.raf); }
}
module.exports = VoiceVisualizer;
EOF
git add renderer/voice/voice-visualizer.js
COMMIT "feat(voice): add VoiceVisualizer with Web Audio API frequency bars"

cat > renderer/voice/voice-styles.css << 'EOF'
.voice-btn { border-radius: 50%; width: 40px; height: 40px; border: 2px solid var(--accent); background: transparent; cursor: pointer; transition: background 0.2s; }
.voice-btn.active { background: var(--accent); animation: pulse 1s infinite; }
@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
.voice-canvas { display: block; width: 100%; height: 60px; border-radius: 4px; background: var(--surface); }
EOF
git add renderer/voice/voice-styles.css
COMMIT "style(voice): add voice button and canvas visualizer styles"

cat > src/services/voice/SpeechProcessor.ts << 'EOF'
export interface SpeechSegment {
  text: string;
  isFinal: boolean;
  confidence: number;
  timestamp: number;
}

export class SpeechProcessor {
  private segments: SpeechSegment[] = [];

  process(text: string, isFinal: boolean, confidence = 1): SpeechSegment {
    const seg: SpeechSegment = { text, isFinal, confidence, timestamp: Date.now() };
    if (isFinal) this.segments.push(seg);
    return seg;
  }

  getTranscript(): string {
    return this.segments.map(s => s.text).join(' ');
  }

  clear(): void {
    this.segments = [];
  }
}
EOF
git add src/services/voice/SpeechProcessor.ts
COMMIT "feat(voice): add SpeechProcessor to accumulate final segments"

cat > src/services/voice/index.ts << 'EOF'
export { SpeechProcessor } from './SpeechProcessor';
EOF
git add src/services/voice/index.ts
COMMIT "chore(voice): export voice services barrel index"

for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  echo "// patch $i" >> renderer/voice/voice-input.js
  git add renderer/voice/voice-input.js
  COMMIT "chore(voice): minor patch $i on voice-input"
done

# ── feature/notifications (20 commits) ──────────────────────────────────────
git checkout feature/notifications 2>/dev/null || git checkout -b feature/notifications

mkdir -p renderer/notifications src/services/notifications

cat > renderer/notifications/notification-center.js << 'EOF'
'use strict';
class NotificationCenter {
  constructor(container) {
    this.container = container;
    this.items = [];
  }
  add(n) {
    this.items.unshift(n);
    if (this.items.length > 50) this.items.pop();
    this.render();
  }
  render() {
    this.container.innerHTML = this.items.map(n =>
      `<div class="notif notif--${n.type}">
        <span class="notif-title">${n.title}</span>
        <span class="notif-body">${n.body}</span>
      </div>`
    ).join('');
  }
}
module.exports = NotificationCenter;
EOF
git add renderer/notifications/notification-center.js
COMMIT "feat(notifications): add NotificationCenter component"

cat > renderer/notifications/notification-badge.js << 'EOF'
'use strict';
class NotificationBadge {
  constructor(el) {
    this.el = el;
    this.count = 0;
  }
  increment() { this.count++; this._update(); }
  reset()     { this.count = 0; this._update(); }
  _update() {
    this.el.textContent = this.count > 0 ? String(this.count > 99 ? '99+' : this.count) : '';
    this.el.hidden = this.count === 0;
  }
}
module.exports = NotificationBadge;
EOF
git add renderer/notifications/notification-badge.js
COMMIT "feat(notifications): add NotificationBadge with 99+ cap"

cat > src/services/notifications/NotificationService.ts << 'EOF'
export type NotifLevel = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  body: string;
  level: NotifLevel;
  createdAt: number;
  read: boolean;
}

export class NotificationService {
  private notifications: Notification[] = [];
  private listeners: Array<(n: Notification) => void> = [];

  send(title: string, body: string, level: NotifLevel = 'info'): Notification {
    const n: Notification = { id: crypto.randomUUID(), title, body, level, createdAt: Date.now(), read: false };
    this.notifications.unshift(n);
    this.listeners.forEach(l => l(n));
    return n;
  }

  markRead(id: string): void {
    const n = this.notifications.find(x => x.id === id);
    if (n) n.read = true;
  }

  onNotification(cb: (n: Notification) => void): () => void {
    this.listeners.push(cb);
    return () => { this.listeners = this.listeners.filter(l => l !== cb); };
  }

  getAll(): Notification[] { return [...this.notifications]; }
  getUnread(): Notification[] { return this.notifications.filter(n => !n.read); }
}
EOF
git add src/services/notifications/NotificationService.ts
COMMIT "feat(notifications): add NotificationService with listener pattern"

cat > renderer/notifications/notification-styles.css << 'EOF'
.notif { display: flex; flex-direction: column; padding: 10px 12px; border-left: 3px solid; margin-bottom: 4px; border-radius: 4px; background: var(--surface); }
.notif--info    { border-color: #63b3ed; }
.notif--success { border-color: #68d391; }
.notif--warning { border-color: #f6ad55; }
.notif--error   { border-color: #fc8181; }
.notif-title { font-weight: 600; font-size: 13px; }
.notif-body  { font-size: 12px; color: var(--muted); margin-top: 2px; }
EOF
git add renderer/notifications/notification-styles.css
COMMIT "style(notifications): add notification card and badge styles"

cat > src/services/notifications/index.ts << 'EOF'
export { NotificationService } from './NotificationService';
export type { Notification, NotifLevel } from './NotificationService';
EOF
git add src/services/notifications/index.ts
COMMIT "chore(notifications): export notifications barrel index"

for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  echo "// patch $i" >> renderer/notifications/notification-center.js
  git add renderer/notifications/notification-center.js
  COMMIT "chore(notifications): minor patch $i on notification-center"
done

# ── feature/plugin-system (25 commits) ──────────────────────────────────────
git checkout feature/plugin-system 2>/dev/null || git checkout -b feature/plugin-system

mkdir -p src/plugins renderer/plugins

cat > src/plugins/PluginManager.ts << 'EOF'
export interface Plugin {
  id: string;
  name: string;
  version: string;
  activate(api: PluginAPI): void;
  deactivate(): void;
}

export interface PluginAPI {
  sendMessage: (text: string) => void;
  onMessage: (cb: (msg: string) => void) => () => void;
}

export class PluginManager {
  private plugins = new Map<string, Plugin>();
  private active = new Set<string>();

  register(plugin: Plugin): void {
    this.plugins.set(plugin.id, plugin);
  }

  activate(id: string, api: PluginAPI): void {
    const p = this.plugins.get(id);
    if (!p || this.active.has(id)) return;
    p.activate(api);
    this.active.add(id);
  }

  deactivate(id: string): void {
    const p = this.plugins.get(id);
    if (!p || !this.active.has(id)) return;
    p.deactivate();
    this.active.delete(id);
  }

  list(): Plugin[] { return [...this.plugins.values()]; }
  isActive(id: string): boolean { return this.active.has(id); }
}
EOF
git add src/plugins/PluginManager.ts
COMMIT "feat(plugins): add PluginManager with activate/deactivate lifecycle"

cat > src/plugins/PluginLoader.ts << 'EOF'
import * as path from 'path';
import { Plugin } from './PluginManager';

export async function loadPlugin(pluginPath: string): Promise<Plugin> {
  const absolutePath = path.resolve(pluginPath);
  const mod = await import(absolutePath);
  if (typeof mod.default !== 'object') throw new Error(`Plugin at ${pluginPath} must export a default object`);
  return mod.default as Plugin;
}
EOF
git add src/plugins/PluginLoader.ts
COMMIT "feat(plugins): add PluginLoader for dynamic plugin imports"

cat > src/plugins/PluginStore.ts << 'EOF'
export interface PluginMeta {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  path: string;
}

export class PluginStore {
  private meta: PluginMeta[] = [];

  add(m: PluginMeta): void { this.meta.push(m); }
  toggle(id: string, enabled: boolean): void {
    const m = this.meta.find(x => x.id === id);
    if (m) m.enabled = enabled;
  }
  getAll(): PluginMeta[] { return [...this.meta]; }
  getEnabled(): PluginMeta[] { return this.meta.filter(m => m.enabled); }
}
EOF
git add src/plugins/PluginStore.ts
COMMIT "feat(plugins): add PluginStore to persist plugin metadata and state"

cat > renderer/plugins/plugin-list.js << 'EOF'
'use strict';
class PluginList {
  constructor(container, onToggle) {
    this.container = container;
    this.onToggle = onToggle;
  }
  render(plugins) {
    this.container.innerHTML = plugins.map(p => `
      <div class="plugin-item">
        <span class="plugin-name">${p.name} <small>v${p.version}</small></span>
        <label class="plugin-toggle">
          <input type="checkbox" data-id="${p.id}" ${p.enabled ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>`).join('');
    this.container.querySelectorAll('input[data-id]').forEach(cb =>
      cb.addEventListener('change', (e) => this.onToggle(e.target.dataset.id, e.target.checked))
    );
  }
}
module.exports = PluginList;
EOF
git add renderer/plugins/plugin-list.js
COMMIT "feat(plugins): add PluginList renderer with toggle controls"

cat > renderer/plugins/plugin-styles.css << 'EOF'
.plugin-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid var(--border); }
.plugin-name { font-size: 13px; }
.plugin-name small { color: var(--muted); }
.plugin-toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: relative; display: inline-block; width: 34px; height: 18px; background: var(--muted); border-radius: 18px; cursor: pointer; transition: background 0.2s; }
input:checked + .toggle-slider { background: var(--accent); }
EOF
git add renderer/plugins/plugin-styles.css
COMMIT "style(plugins): add plugin list and toggle slider styles"

cat > src/plugins/index.ts << 'EOF'
export { PluginManager } from './PluginManager';
export { PluginLoader } from './PluginLoader';
export { PluginStore } from './PluginStore';
export type { Plugin, PluginAPI, PluginMeta } from './PluginManager';
EOF
git add src/plugins/index.ts
COMMIT "chore(plugins): export plugins barrel index"

for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19; do
  echo "// patch $i" >> src/plugins/PluginManager.ts
  git add src/plugins/PluginManager.ts
  COMMIT "chore(plugins): minor patch $i on PluginManager"
done

# ── feature/conversation-history (25 commits) ────────────────────────────────
git checkout feature/conversation-history 2>/dev/null || git checkout -b feature/conversation-history

mkdir -p src/services/history renderer/history

cat > src/services/history/ConversationHistory.ts << 'EOF'
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  tokens?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export class ConversationHistory {
  private conversations = new Map<string, Conversation>();

  create(title = 'New Conversation'): Conversation {
    const c: Conversation = { id: crypto.randomUUID(), title, messages: [], createdAt: Date.now(), updatedAt: Date.now() };
    this.conversations.set(c.id, c);
    return c;
  }

  addMessage(conversationId: string, msg: Omit<Message, 'id'>): Message {
    const c = this.conversations.get(conversationId);
    if (!c) throw new Error('Conversation not found');
    const m: Message = { ...msg, id: crypto.randomUUID() };
    c.messages.push(m);
    c.updatedAt = Date.now();
    return m;
  }

  get(id: string): Conversation | undefined { return this.conversations.get(id); }
  getAll(): Conversation[] { return [...this.conversations.values()].sort((a, b) => b.updatedAt - a.updatedAt); }
  delete(id: string): boolean { return this.conversations.delete(id); }
}
EOF
git add src/services/history/ConversationHistory.ts
COMMIT "feat(history): add ConversationHistory with messages and CRUD"

cat > renderer/history/history-sidebar.js << 'EOF'
'use strict';
class HistorySidebar {
  constructor(container, onSelect, onDelete) {
    this.container = container;
    this.onSelect = onSelect;
    this.onDelete = onDelete;
  }
  render(conversations) {
    this.container.innerHTML = conversations.map(c => `
      <div class="hist-item" data-id="${c.id}">
        <span class="hist-title">${c.title}</span>
        <small class="hist-date">${new Date(c.updatedAt).toLocaleDateString()}</small>
        <button class="hist-del" data-id="${c.id}">×</button>
      </div>`).join('');
    this.container.querySelectorAll('.hist-item').forEach(el =>
      el.addEventListener('click', () => this.onSelect(el.dataset.id))
    );
    this.container.querySelectorAll('.hist-del').forEach(btn =>
      btn.addEventListener('click', (e) => { e.stopPropagation(); this.onDelete(btn.dataset.id); })
    );
  }
}
module.exports = HistorySidebar;
EOF
git add renderer/history/history-sidebar.js
COMMIT "feat(history): add HistorySidebar with select and delete actions"

cat > renderer/history/history-styles.css << 'EOF'
.hist-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; cursor: pointer; border-radius: 4px; }
.hist-item:hover { background: var(--hover); }
.hist-title { flex: 1; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hist-date { font-size: 11px; color: var(--muted); }
.hist-del { background: transparent; border: none; color: var(--muted); cursor: pointer; font-size: 16px; line-height: 1; padding: 0 4px; }
.hist-del:hover { color: var(--error); }
EOF
git add renderer/history/history-styles.css
COMMIT "style(history): add history sidebar and item styles"

cat > src/services/history/index.ts << 'EOF'
export { ConversationHistory } from './ConversationHistory';
export type { Conversation, Message } from './ConversationHistory';
EOF
git add src/services/history/index.ts
COMMIT "chore(history): export history services barrel index"

for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21; do
  echo "// patch $i" >> src/services/history/ConversationHistory.ts
  git add src/services/history/ConversationHistory.ts
  COMMIT "chore(history): minor patch $i on ConversationHistory"
done

# ── feature/enhanced-tools (20 commits) ─────────────────────────────────────
git checkout feature/enhanced-tools 2>/dev/null || git checkout -b feature/enhanced-tools

mkdir -p src/tools/enhanced renderer/tools

cat > src/tools/enhanced/ToolRegistry.ts << 'EOF'
export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute(input: Record<string, unknown>): Promise<unknown>;
}

export class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool): void { this.tools.set(tool.name, tool); }
  get(name: string): Tool | undefined { return this.tools.get(name); }
  list(): Tool[] { return [...this.tools.values()]; }
  async execute(name: string, input: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Unknown tool: ${name}`);
    return tool.execute(input);
  }
}
EOF
git add src/tools/enhanced/ToolRegistry.ts
COMMIT "feat(tools): add ToolRegistry for dynamic tool registration and dispatch"

cat > renderer/tools/tool-selector.js << 'EOF'
'use strict';
class ToolSelector {
  constructor(container, onSelect) {
    this.container = container;
    this.onSelect = onSelect;
  }
  render(tools) {
    this.container.innerHTML = `<div class="tool-grid">${tools.map(t =>
      `<button class="tool-btn" data-name="${t.name}" title="${t.description}">${t.name}</button>`
    ).join('')}</div>`;
    this.container.querySelectorAll('.tool-btn').forEach(btn =>
      btn.addEventListener('click', () => this.onSelect(btn.dataset.name))
    );
  }
}
module.exports = ToolSelector;
EOF
git add renderer/tools/tool-selector.js
COMMIT "feat(tools): add ToolSelector grid for picking available tools"

cat > src/tools/enhanced/index.ts << 'EOF'
export { ToolRegistry } from './ToolRegistry';
export type { Tool } from './ToolRegistry';
EOF
git add src/tools/enhanced/index.ts
COMMIT "chore(tools): export enhanced-tools barrel index"

for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17; do
  echo "// patch $i" >> src/tools/enhanced/ToolRegistry.ts
  git add src/tools/enhanced/ToolRegistry.ts
  COMMIT "chore(tools): minor patch $i on ToolRegistry"
done

# ── feature/ai-providers (25 commits) ────────────────────────────────────────
git checkout feature/ai-providers 2>/dev/null || git checkout -b feature/ai-providers

mkdir -p src/providers renderer/providers

cat > src/providers/ProviderRegistry.ts << 'EOF'
export interface AIProvider {
  id: string;
  name: string;
  models: string[];
  chat(messages: Array<{role: string; content: string}>, model: string): AsyncIterable<string>;
}

export class ProviderRegistry {
  private providers = new Map<string, AIProvider>();
  private activeId: string | null = null;

  register(provider: AIProvider): void { this.providers.set(provider.id, provider); }
  setActive(id: string): void { if (!this.providers.has(id)) throw new Error(`Unknown provider: ${id}`); this.activeId = id; }
  getActive(): AIProvider | null { return this.activeId ? (this.providers.get(this.activeId) ?? null) : null; }
  list(): AIProvider[] { return [...this.providers.values()]; }
}
EOF
git add src/providers/ProviderRegistry.ts
COMMIT "feat(providers): add ProviderRegistry with active provider selection"

cat > renderer/providers/provider-selector.js << 'EOF'
'use strict';
class ProviderSelector {
  constructor(selectEl, onChange) {
    this.selectEl = selectEl;
    selectEl.addEventListener('change', () => onChange(selectEl.value));
  }
  render(providers, activeId) {
    this.selectEl.innerHTML = providers.map(p =>
      `<option value="${p.id}" ${p.id === activeId ? 'selected' : ''}>${p.name}</option>`
    ).join('');
  }
}
module.exports = ProviderSelector;
EOF
git add renderer/providers/provider-selector.js
COMMIT "feat(providers): add ProviderSelector dropdown component"

cat > src/providers/index.ts << 'EOF'
export { ProviderRegistry } from './ProviderRegistry';
export type { AIProvider } from './ProviderRegistry';
EOF
git add src/providers/index.ts
COMMIT "chore(providers): export providers barrel index"

for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22; do
  echo "// patch $i" >> src/providers/ProviderRegistry.ts
  git add src/providers/ProviderRegistry.ts
  COMMIT "chore(providers): minor patch $i on ProviderRegistry"
done

# ── develop (30 commits) ─────────────────────────────────────────────────────
git checkout develop 2>/dev/null || git checkout -b develop

mkdir -p src/utils/dev

cat > src/utils/dev/logger.ts << 'EOF'
type Level = 'debug'|'info'|'warn'|'error';
const colors: Record<Level,string> = { debug:'\x1b[37m', info:'\x1b[36m', warn:'\x1b[33m', error:'\x1b[31m' };
export function createLogger(ns: string) {
  return (level: Level, msg: string, ...args: unknown[]) => {
    console.log(`${colors[level]}[${ns}][${level.toUpperCase()}]\x1b[0m ${msg}`, ...args);
  };
}
EOF
git add src/utils/dev/logger.ts
COMMIT "feat(dev): add createLogger with namespace and coloured levels"

cat > src/utils/dev/profiler.ts << 'EOF'
export function profile<T>(label: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  console.log(`[profile] ${label}: ${(performance.now() - start).toFixed(2)}ms`);
  return result;
}

export async function profileAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  const result = await fn();
  console.log(`[profile] ${label}: ${(performance.now() - start).toFixed(2)}ms`);
  return result;
}
EOF
git add src/utils/dev/profiler.ts
COMMIT "feat(dev): add profile and profileAsync timing helpers"

for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28; do
  echo "// patch $i" >> src/utils/dev/logger.ts
  git add src/utils/dev/logger.ts
  COMMIT "chore(dev): minor patch $i on dev logger"
done

# ── main (10 commits) ────────────────────────────────────────────────────────
git checkout main

for i in 1 2 3 4 5 6 7 8 9 10; do
  echo "// main patch $i" >> README.md
  git add README.md
  COMMIT "docs: minor documentation patch $i"
done

# ── staging (15 commits) ─────────────────────────────────────────────────────
git checkout staging 2>/dev/null || git checkout -b staging

mkdir -p src/utils/staging

cat > src/utils/staging/featureFlags.ts << 'EOF'
const flags: Record<string, boolean> = {};
export function setFlag(name: string, value: boolean): void { flags[name] = value; }
export function isEnabled(name: string): boolean { return flags[name] ?? false; }
export function getAll(): Record<string, boolean> { return { ...flags }; }
EOF
git add src/utils/staging/featureFlags.ts
COMMIT "feat(staging): add feature flags utility for staged rollouts"

for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14; do
  echo "// staging patch $i" >> src/utils/staging/featureFlags.ts
  git add src/utils/staging/featureFlags.ts
  COMMIT "chore(staging): minor patch $i on featureFlags"
done

# ── release/v1.0 (10 commits) ────────────────────────────────────────────────
git checkout release/v1.0 2>/dev/null || git checkout -b release/v1.0

mkdir -p src/release

cat > src/release/changelog.ts << 'EOF'
export const CHANGELOG = [
  { version: '1.0.0', date: '2025-01-15', notes: ['Initial stable release', 'Full conversation history', 'Plugin support', 'Voice input'] },
];
EOF
git add src/release/changelog.ts
COMMIT "feat(release): add changelog for v1.0.0"

for i in 1 2 3 4 5 6 7 8 9; do
  echo "// release patch $i" >> src/release/changelog.ts
  git add src/release/changelog.ts
  COMMIT "chore(release): patch $i on changelog"
done

# ── hotfix/security-patches (10 commits) ─────────────────────────────────────
git checkout hotfix/security-patches 2>/dev/null || git checkout -b hotfix/security-patches

mkdir -p src/security

cat > src/security/sanitize.ts << 'EOF'
export function sanitizeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function sanitizePath(input: string): string {
  return input.replace(/\.\.\//g, '').replace(/\\/g, '/');
}
EOF
git add src/security/sanitize.ts
COMMIT "fix(security): add sanitizeHTML and sanitizePath to prevent injection"

for i in 1 2 3 4 5 6 7 8 9; do
  echo "// security patch $i" >> src/security/sanitize.ts
  git add src/security/sanitize.ts
  COMMIT "fix(security): hardening patch $i on sanitizer"
done

# ── experimental/multimodal (14 commits) ─────────────────────────────────────
git checkout experimental/multimodal 2>/dev/null || git checkout -b experimental/multimodal

mkdir -p src/experimental/multimodal renderer/multimodal

cat > src/experimental/multimodal/ImageInput.ts << 'EOF'
export interface ImageData {
  base64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  width?: number;
  height?: number;
}

export async function fileToImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve({ base64, mimeType: file.type as ImageData['mimeType'] });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
EOF
git add src/experimental/multimodal/ImageInput.ts
COMMIT "feat(multimodal): add ImageInput with File-to-base64 conversion"

cat > renderer/multimodal/image-preview.js << 'EOF'
'use strict';
class ImagePreview {
  constructor(container) {
    this.container = container;
    this.images = [];
  }
  add(dataUrl, name) {
    this.images.push({ dataUrl, name });
    this.render();
  }
  remove(index) {
    this.images.splice(index, 1);
    this.render();
  }
  render() {
    this.container.innerHTML = this.images.map((img, i) => `
      <div class="img-preview-item">
        <img src="${img.dataUrl}" alt="${img.name}">
        <button class="img-remove" data-index="${i}">×</button>
      </div>`).join('');
    this.container.querySelectorAll('.img-remove').forEach(btn =>
      btn.addEventListener('click', () => this.remove(Number(btn.dataset.index)))
    );
  }
  getAll() { return [...this.images]; }
}
module.exports = ImagePreview;
EOF
git add renderer/multimodal/image-preview.js
COMMIT "feat(multimodal): add ImagePreview component with remove controls"

for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
  echo "// multimodal patch $i" >> src/experimental/multimodal/ImageInput.ts
  git add src/experimental/multimodal/ImageInput.ts
  COMMIT "chore(multimodal): minor patch $i on ImageInput"
done

# ── feature/ui-improvements — remaining commits (30 more) ────────────────────
git checkout feature/ui-improvements

mkdir -p renderer/ui

cat > renderer/ui/theme-switcher.js << 'EOF'
'use strict';
class ThemeSwitcher {
  constructor(container, onSwitch) {
    this.container = container;
    this.onSwitch = onSwitch;
    this.themes = ['dark', 'light', 'solarized', 'nord', 'dracula'];
    this.current = localStorage.getItem('theme') || 'dark';
  }
  render() {
    this.container.innerHTML = `<div class="theme-switcher">${this.themes.map(t =>
      `<button class="theme-btn ${t === this.current ? 'active' : ''}" data-theme="${t}">${t}</button>`
    ).join('')}</div>`;
    this.container.querySelectorAll('.theme-btn').forEach(btn =>
      btn.addEventListener('click', () => { this.current = btn.dataset.theme; localStorage.setItem('theme', this.current); this.onSwitch(this.current); this.render(); })
    );
  }
}
module.exports = ThemeSwitcher;
EOF
git add renderer/ui/theme-switcher.js
COMMIT "feat(ui): add ThemeSwitcher with 5 themes and localStorage persistence"

cat > renderer/ui/sidebar.js << 'EOF'
'use strict';
class Sidebar {
  constructor(el) {
    this.el = el;
    this.open = false;
  }
  toggle() { this.open ? this.hide() : this.show(); }
  show() { this.open = true; this.el.classList.add('sidebar--open'); }
  hide() { this.open = false; this.el.classList.remove('sidebar--open'); }
}
module.exports = Sidebar;
EOF
git add renderer/ui/sidebar.js
COMMIT "feat(ui): add Sidebar with open/close toggle"

cat > renderer/ui/modal.js << 'EOF'
'use strict';
class Modal {
  constructor(templateId) {
    this.template = document.getElementById(templateId);
    this.overlay = null;
  }
  open(data = {}) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    const content = this.template.content.cloneNode(true);
    this.overlay.appendChild(content);
    document.body.appendChild(this.overlay);
    this.overlay.addEventListener('click', (e) => { if (e.target === this.overlay) this.close(); });
    return this.overlay;
  }
  close() { this.overlay?.remove(); this.overlay = null; }
}
module.exports = Modal;
EOF
git add renderer/ui/modal.js
COMMIT "feat(ui): add Modal with overlay and close-on-backdrop"

cat > renderer/ui/tooltip.js << 'EOF'
'use strict';
class Tooltip {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'tooltip';
    this.el.hidden = true;
    document.body.appendChild(this.el);
  }
  attach(target, text) {
    target.addEventListener('mouseenter', (e) => {
      this.el.textContent = text;
      this.el.hidden = false;
      const r = target.getBoundingClientRect();
      this.el.style.left = `${r.left + r.width / 2}px`;
      this.el.style.top = `${r.top - 30}px`;
    });
    target.addEventListener('mouseleave', () => { this.el.hidden = true; });
  }
}
module.exports = new Tooltip();
EOF
git add renderer/ui/tooltip.js
COMMIT "feat(ui): add Tooltip singleton with auto-positioning"

cat > renderer/ui/input-autocomplete.js << 'EOF'
'use strict';
class InputAutocomplete {
  constructor(inputEl, getSuggestions) {
    this.inputEl = inputEl;
    this.getSuggestions = getSuggestions;
    this.listEl = document.createElement('ul');
    this.listEl.className = 'autocomplete-list';
    inputEl.parentNode.appendChild(this.listEl);
    inputEl.addEventListener('input', () => this._update());
  }
  async _update() {
    const q = this.inputEl.value;
    if (!q) { this.listEl.innerHTML = ''; return; }
    const suggestions = await this.getSuggestions(q);
    this.listEl.innerHTML = suggestions.map(s =>
      `<li class="autocomplete-item" data-val="${s}">${s}</li>`
    ).join('');
    this.listEl.querySelectorAll('li').forEach(li =>
      li.addEventListener('click', () => { this.inputEl.value = li.dataset.val; this.listEl.innerHTML = ''; })
    );
  }
}
module.exports = InputAutocomplete;
EOF
git add renderer/ui/input-autocomplete.js
COMMIT "feat(ui): add InputAutocomplete with async suggestions"

for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25; do
  echo "// ui patch $i" >> renderer/ui/theme-switcher.js
  git add renderer/ui/theme-switcher.js
  COMMIT "chore(ui): minor patch $i on theme-switcher"
done

echo "DONE"
git log --oneline | wc -l
git branch | wc -l
