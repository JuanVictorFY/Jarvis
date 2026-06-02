"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const tokenUtils_1 = require("../utils/tokenUtils");
(0, node_test_1.describe)('estimateTokens', () => {
    (0, node_test_1.it)('returns 0 for empty string', () => {
        strict_1.default.equal((0, tokenUtils_1.estimateTokens)(''), 0);
    });
    (0, node_test_1.it)('estimates ~1 token per 4 chars', () => {
        strict_1.default.equal((0, tokenUtils_1.estimateTokens)('abcd'), 1);
        strict_1.default.equal((0, tokenUtils_1.estimateTokens)('abcdefgh'), 2);
    });
    (0, node_test_1.it)('rounds up for partial chunks', () => {
        strict_1.default.equal((0, tokenUtils_1.estimateTokens)('abc'), 1);
        strict_1.default.equal((0, tokenUtils_1.estimateTokens)('abcde'), 2);
    });
});
(0, node_test_1.describe)('truncateToTokenBudget', () => {
    (0, node_test_1.it)('returns the original text when within budget', () => {
        const text = 'hello world';
        strict_1.default.equal((0, tokenUtils_1.truncateToTokenBudget)(text, 100), text);
    });
    (0, node_test_1.it)('truncates and inserts omission marker when over budget', () => {
        const long = 'a'.repeat(400); // ~100 tokens
        const result = (0, tokenUtils_1.truncateToTokenBudget)(long, 10);
        strict_1.default.ok(result.includes('tokens omitted'), 'should include omission marker');
        strict_1.default.ok(result.length < long.length, 'result should be shorter');
    });
    (0, node_test_1.it)('preserves start and end of text', () => {
        const text = 'START' + 'x'.repeat(400) + 'END';
        const result = (0, tokenUtils_1.truncateToTokenBudget)(text, 10);
        strict_1.default.ok(result.startsWith('START'), 'should preserve start');
        strict_1.default.ok(result.endsWith('END'), 'should preserve end');
    });
});
(0, node_test_1.describe)('extractSignatures', () => {
    (0, node_test_1.it)('extracts TypeScript function signatures', () => {
        const src = `
export function hello(name: string): string {
  return 'hello ' + name;
}
export const foo = 1;
`;
        const result = (0, tokenUtils_1.extractSignatures)(src, 'typescript');
        strict_1.default.ok(result.includes('hello'), 'should include function name');
    });
    (0, node_test_1.it)('falls back to truncation for unknown language', () => {
        const text = 'some ruby code here';
        const result = (0, tokenUtils_1.extractSignatures)(text, 'ruby');
        strict_1.default.ok(typeof result === 'string');
    });
});
//# sourceMappingURL=tokenUtils.test.js.map