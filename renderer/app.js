'use strict';
/* global jarvis */

// ── Code registry (id → {code, lang}) ─────────────────────────────────────
const codeReg = new Map();
let codeId = 0;

// ── DOM refs ───────────────────────────────────────────────────────────────
const messagesEl    = document.getElementById('messages');
const inputEl       = document.getElementById('user-input');
const sendBtn       = document.getElementById('btn-send');
const clearBtn      = document.getElementById('btn-clear');
const settingsOpen  = document.getElementById('btn-settings-open');
const settingsOvl   = document.getElementById('settings-overlay');
const settingsCancel = document.getElementById('btn-settings-cancel');
const settingsSave  = document.getElementById('btn-settings-save');

// ── Settings fields (basic) ────────────────────────────────────────────────
const cfgKey        = document.getElementById('cfg-key');
const cfgModel      = document.getElementById('cfg-model');
const cfgTokens     = document.getElementById('cfg-tokens');
// ── Settings fields (providers) ───────────────────────────────────────────
const cfgOpenAIKey  = document.getElementById('cfg-openai-key');
const cfgGeminiKey  = document.getElementById('cfg-gemini-key');
const cfgOllamaUrl  = document.getElementById('cfg-ollama-url');
const cfgProvider   = document.getElementById('cfg-provider');
const cfgTheme      = document.getElementById('cfg-theme');

// ── Token stats ────────────────────────────────────────────────────────────
const statIn  = document.getElementById('stat-in');
const statOut = document.getElementById('stat-out');
let sessionInputTokens  = 0;
let sessionOutputTokens = 0;

function updateTokenStats(inTok, outTok) {
  sessionInputTokens  += inTok;
  sessionOutputTokens += outTok;
  if (statIn)  statIn.textContent  = fmtTokens(sessionInputTokens);
  if (statOut) statOut.textContent = fmtTokens(sessionOutputTokens);
}

function fmtTokens(n) {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
}

// ── Streaming state ────────────────────────────────────────────────────────
let streaming   = false;
let streamText  = '';
let streamBubble = null;

// ── Tool cards map ─────────────────────────────────────────────────────────
const toolCards = new Map();

// ── Input auto-resize ──────────────────────────────────────────────────────
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 130) + 'px';
});

inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

sendBtn.addEventListener('click', sendMessage);

clearBtn?.addEventListener('click', () => {
  jarvis.clearHistory();
  messagesEl.innerHTML = '';
  codeReg.clear(); codeId = 0;
  toolCards.clear();
});

// ── Settings ───────────────────────────────────────────────────────────────
settingsOpen?.addEventListener('click', openSettings);
settingsCancel?.addEventListener('click', () => settingsOvl?.classList.remove('visible'));

settingsSave?.addEventListener('click', async () => {
  await jarvis.saveConfig({
    anthropicApiKey: cfgKey.value.trim(),
    model:           cfgModel.value,
    maxTokens:       parseInt(cfgTokens.value, 10) || 8192,
    openaiApiKey:    cfgOpenAIKey?.value.trim() ?? '',
    geminiApiKey:    cfgGeminiKey?.value.trim() ?? '',
    ollamaBaseUrl:   cfgOllamaUrl?.value.trim() || 'http://localhost:11434',
    defaultProvider: cfgProvider?.value ?? 'anthropic',
    theme:           cfgTheme?.value ?? 'dark',
  });
  settingsOvl?.classList.remove('visible');
});

async function openSettings() {
  const cfg = await jarvis.getConfig();
  cfgKey.value    = cfg.anthropicApiKey ?? '';
  cfgModel.value  = cfg.model ?? 'claude-sonnet-4-6';
  cfgTokens.value = String(cfg.maxTokens ?? 8192);
  if (cfgOpenAIKey) cfgOpenAIKey.value = cfg.openaiApiKey ?? '';
  if (cfgGeminiKey) cfgGeminiKey.value = cfg.geminiApiKey ?? '';
  if (cfgOllamaUrl) cfgOllamaUrl.value = cfg.ollamaBaseUrl ?? 'http://localhost:11434';
  if (cfgProvider)  cfgProvider.value  = cfg.defaultProvider ?? 'anthropic';
  if (cfgTheme)     cfgTheme.value     = cfg.theme ?? 'dark';
  settingsOvl?.classList.add('visible');
}

jarvis.onOpenSettings(cfg => {
  cfgKey.value    = cfg.anthropicApiKey ?? '';
  cfgModel.value  = cfg.model ?? 'claude-sonnet-4-6';
  cfgTokens.value = String(cfg.maxTokens ?? 8192);
  if (cfgOpenAIKey) cfgOpenAIKey.value = cfg.openaiApiKey ?? '';
  if (cfgGeminiKey) cfgGeminiKey.value = cfg.geminiApiKey ?? '';
  if (cfgOllamaUrl) cfgOllamaUrl.value = cfg.ollamaBaseUrl ?? 'http://localhost:11434';
  if (cfgProvider)  cfgProvider.value  = cfg.defaultProvider ?? 'anthropic';
  if (cfgTheme)     cfgTheme.value     = cfg.theme ?? 'dark';
  settingsOvl?.classList.add('visible');
});

// ── Notifications ──────────────────────────────────────────────────────────
jarvis.notifications.onNew(n => {
  showToast(n.title, n.level ?? 'info');
});

function showToast(msg, level = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast--${level}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ── Event delegation on messages ──────────────────────────────────────────
messagesEl.addEventListener('click', e => {
  const btn = e.target instanceof Element ? e.target.closest('[data-action]') : null;
  if (!btn) return;

  const toggle = e.target instanceof Element ? e.target.closest('.tool-header') : null;
  if (toggle?.closest('.tool-card')) {
    toggle.closest('.tool-card')?.classList.toggle('expanded');
    return;
  }

  const action = btn.dataset.action;
  const id = parseInt(btn.dataset.id ?? '0', 10);
  const entry = codeReg.get(id);

  if (action === 'confirm-ok' || action === 'confirm-deny') {
    resolveConfirm(btn.dataset.confirmId ?? '', action === 'confirm-ok', btn.closest('.confirm-card'));
    return;
  }

  if (!entry) return;

  if (action === 'copy') {
    navigator.clipboard.writeText(entry.code).catch(() => {});
    const orig = btn.textContent;
    btn.textContent = '✓ Copied';
    setTimeout(() => { btn.textContent = orig; }, 1400);
  } else if (action === 'run') {
    inputEl.value = `Please run this command:\n\`\`\`bash\n${entry.code.trim()}\n\`\`\``;
    sendMessage();
  }
});

function resolveConfirm(id, ok, card) {
  jarvis.confirmAction(id, ok);
  if (card) {
    card.innerHTML = `<span style="color:${ok ? '#50c050' : '#e05050'};font-size:12px">
      ${ok ? '✓ Allowed' : '✗ Denied'}</span>`;
  }
}

// ── Send ───────────────────────────────────────────────────────────────────
async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text || streaming) return;

  appendMsg('user', text);
  inputEl.value = '';
  inputEl.style.height = 'auto';

  setStreaming(true);
  streamText   = '';
  streamBubble = createBubble('assistant');
  streamBubble.classList.add('streaming');

  try {
    await jarvis.sendMessage(text);
  } catch (err) {
    appendMsg('error', '⚠ ' + String(err));
    setStreaming(false);
  }
}

// ── Agent events ───────────────────────────────────────────────────────────
jarvis.onAgentEvent(ev => {
  switch (ev.type) {

    case 'text':
      streamText += ev.text;
      if (streamBubble) streamBubble.textContent = streamText;
      scrollBottom();
      break;

    case 'text_done':
      if (streamBubble && streamText) {
        streamBubble.innerHTML = renderMarkdown(streamText);
        streamText = '';
        scrollBottom();
      }
      break;

    case 'tool_start': {
      ensureAssistantBubble();
      const card = buildToolCard(ev.id, ev.name, ev.summary);
      streamBubble?.appendChild(card);
      toolCards.set(ev.id, card);
      scrollBottom();
      break;
    }

    case 'tool_done': {
      const card = toolCards.get(ev.id);
      if (card) {
        const status = card.querySelector('.tool-status');
        if (status) {
          status.textContent = ev.isError ? '✗ error' : '✓ done';
          status.className   = 'tool-status ' + (ev.isError ? 'error' : 'done');
        }
        const body = card.querySelector('.tool-result-body');
        if (body) body.textContent = ev.result;
      }
      scrollBottom();
      break;
    }

    case 'confirm': {
      ensureAssistantBubble();
      streamBubble?.appendChild(buildConfirmCard(ev.id, ev.action, ev.detail));
      setStreaming(true);
      scrollBottom();
      break;
    }

    case 'done':
      updateTokenStats(ev.inputTokens ?? 0, ev.outputTokens ?? 0);
      finalizeAssistantBubble();
      setStreaming(false);
      inputEl.focus();
      break;

    case 'error':
      finalizeAssistantBubble();
      appendMsg('error', '⚠ ' + ev.message);
      setStreaming(false);
      break;
  }
});

// ── Bubble helpers ─────────────────────────────────────────────────────────
function ensureAssistantBubble() {
  if (!streamBubble) streamBubble = createBubble('assistant');
}

function finalizeAssistantBubble() {
  if (streamBubble) {
    streamBubble.classList.remove('streaming');
    if (streamText) {
      const div = document.createElement('div');
      div.innerHTML = renderMarkdown(streamText);
      streamBubble.appendChild(div);
      streamText = '';
    }
    streamBubble = null;
  }
}

function createBubble(role) {
  const el = document.createElement('div');
  el.className = `msg ${role}`;
  messagesEl.appendChild(el);
  scrollBottom();
  return el;
}

function appendMsg(role, text) {
  const el = createBubble(role);
  el.textContent = text;
  return el;
}

function scrollBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function setStreaming(v) {
  streaming = v;
  sendBtn.disabled  = v;
  inputEl.disabled  = v;
}

function buildToolCard(id, name, summary) {
  const card = document.createElement('div');
  card.className = 'tool-card';
  card.innerHTML = `
    <div class="tool-header">
      <span class="tool-icon">🔧</span>
      <span class="tool-name">${escHtml(name)}</span>
      <span class="tool-summary">${escHtml(summary)}</span>
      <span class="tool-status running">⟳ running</span>
    </div>
    <div class="tool-result-body"></div>`;
  card.querySelector('.tool-header')?.addEventListener('click', () =>
    card.classList.toggle('expanded'),
  );
  return card;
}

function buildConfirmCard(id, action, detail) {
  const card = document.createElement('div');
  card.className = 'confirm-card';
  card.innerHTML = `
    <div class="confirm-title">⚠ Jarvis wants to: ${escHtml(action)}</div>
    <div class="confirm-detail">${escHtml(detail)}</div>
    <div class="confirm-btns">
      <button class="btn btn-primary btn-small"  data-action="confirm-ok"   data-confirm-id="${escHtml(id)}">✓ Allow</button>
      <button class="btn btn-danger  btn-small"  data-action="confirm-deny" data-confirm-id="${escHtml(id)}">✗ Deny</button>
    </div>`;
  return card;
}

// ── Markdown renderer ──────────────────────────────────────────────────────
const SHELL_LANGS = new Set(['bash', 'shell', 'sh', 'zsh', 'powershell', 'ps1', 'cmd', 'bat']);

function renderMarkdown(text) {
  const parts = text.split(/(```[\w-]*\n[\s\S]*?```)/g);
  return parts.map(part => {
    const m = part.match(/^```([\w-]*)\n([\s\S]*?)```$/);
    if (m) {
      const lang = (m[1] ?? '').toLowerCase();
      const code = (m[2] ?? '').replace(/\n$/, '');
      const id   = ++codeId;
      codeReg.set(id, { code, lang: lang || 'text' });
      const isShell = SHELL_LANGS.has(lang);
      const runBtn = isShell
        ? `<button class="btn btn-small btn-secondary code-btn" data-action="run"  data-id="${id}">▶ Run</button>`
        : '';
      return `<div class="code-block">`
        + `<div class="code-header"><span class="lang-label">${escHtml(lang || 'text')}</span>`
        + `<div class="code-btns">`
        + `<button class="btn btn-small btn-secondary code-btn" data-action="copy" data-id="${id}">Copy</button>`
        + runBtn
        + `</div></div><pre><code>${escHtml(code)}</code></pre></div>`;
    }
    return escHtml(part)
      .replace(/`([^`\n]+)`/g, (_, c) => `<code class="inline">${c}</code>`)
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }).join('');
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Init ───────────────────────────────────────────────────────────────────
inputEl.focus();

jarvis.getConfig().then(cfg => {
  if (!cfg.anthropicApiKey) openSettings();
});
