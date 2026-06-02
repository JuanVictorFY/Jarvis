const CHARS_PER_TOKEN = 4;

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function truncateToTokenBudget(text: string, maxTokens: number): string {
  const maxChars = maxTokens * CHARS_PER_TOKEN;
  if (text.length <= maxChars) {
    return text;
  }

  const half = Math.floor(maxChars / 2);
  const start = text.slice(0, half);
  const end = text.slice(-half);
  const skipped = estimateTokens(text) - maxTokens;

  return `${start}\n\n... [~${skipped} tokens omitted] ...\n\n${end}`;
}

export function extractSignatures(text: string, language: string): string {
  const patterns: Partial<Record<string, RegExp>> = {
    typescript: /^(?:export\s+)?(?:async\s+)?(?:function|class|const|interface|type|enum|abstract\s+class)\s+\w+[^{;=]*/gm,
    javascript: /^(?:export\s+)?(?:async\s+)?(?:function|class|const)\s+\w+[^{;=]*/gm,
    python: /^(?:def|class|async\s+def)\s+\w+[^:]*:/gm,
    java: /^(?:public|private|protected)?\s*(?:static\s+)?(?:\w+\s+)+\w+\s*\([^)]*\)/gm,
    go: /^func\s+(?:\([^)]+\)\s+)?\w+\s*\([^)]*\)/gm,
  };

  const pattern = patterns[language];
  if (!pattern) {
    return truncateToTokenBudget(text, 500);
  }

  const matches = text.match(pattern) ?? [];
  return matches.join('\n') || truncateToTokenBudget(text, 500);
}
