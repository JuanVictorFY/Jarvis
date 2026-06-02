'use strict';

const KEYWORDS = {
  javascript: ['const', 'let', 'var', 'function', 'class', 'return', 'if', 'else', 'for',
    'while', 'import', 'export', 'from', 'default', 'async', 'await', 'try', 'catch', 'throw',
    'new', 'this', 'typeof', 'instanceof', 'null', 'undefined', 'true', 'false'],
  typescript: ['interface', 'type', 'enum', 'readonly', 'public', 'private', 'protected',
    'abstract', 'implements', 'extends', 'namespace', 'declare', 'as'],
  python: ['def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else', 'for', 'while',
    'with', 'as', 'try', 'except', 'finally', 'raise', 'pass', 'lambda', 'yield', 'True', 'False', 'None'],
};

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function detectLanguage(code, hint) {
  if (hint && hint !== '') { return hint; }
  if (code.includes('def ') || code.includes('import ') && !code.includes('from \'')) { return 'python'; }
  if (code.includes('interface ') || code.includes(': string') || code.includes(': number')) { return 'typescript'; }
  if (code.includes('const ') || code.includes('let ') || code.includes('=>')) { return 'javascript'; }
  return 'text';
}

function tokenize(code, lang) {
  let result = escapeHtml(code);

  const keywords = [...(KEYWORDS.javascript || []), ...(KEYWORDS[lang] || [])];
  const kwPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
  result = result.replace(kwPattern, '<span class="hl-keyword">$1</span>');

  result = result.replace(/(\/\/[^\n]*)/g, '<span class="hl-comment">$1</span>');
  result = result.replace(/(#[^\n]*)/g, '<span class="hl-comment">$1</span>');
  result = result.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
    '<span class="hl-string">$1</span>');
  result = result.replace(/\b(\d+\.?\d*)\b/g, '<span class="hl-number">$1</span>');
  result = result.replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span class="hl-class">$1</span>');

  return result;
}

function highlightCodeBlock(preEl) {
  const code = preEl.querySelector('code');
  if (!code) { return; }
  const rawText = code.textContent ?? '';
  const langClass = Array.from(code.classList).find((c) => c.startsWith('language-'));
  const lang = langClass ? langClass.replace('language-', '') : detectLanguage(rawText, '');
  code.innerHTML = tokenize(rawText, lang);
  preEl.dataset.language = lang;
}

function highlightAll(root) {
  root.querySelectorAll('pre').forEach(highlightCodeBlock);
}

window.highlightCodeBlock = highlightCodeBlock;
window.highlightAll = highlightAll;
window.detectLanguage = detectLanguage;
