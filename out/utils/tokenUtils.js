"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateTokens = estimateTokens;
exports.truncateToTokenBudget = truncateToTokenBudget;
exports.extractSignatures = extractSignatures;
const CHARS_PER_TOKEN = 4;
function estimateTokens(text) {
    return Math.ceil(text.length / CHARS_PER_TOKEN);
}
function truncateToTokenBudget(text, maxTokens) {
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
function extractSignatures(text, language) {
    const patterns = {
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
//# sourceMappingURL=tokenUtils.js.map