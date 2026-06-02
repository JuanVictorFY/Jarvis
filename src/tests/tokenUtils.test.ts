import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { estimateTokens, truncateToTokenBudget, extractSignatures } from '../utils/tokenUtils';

describe('estimateTokens', () => {
  it('returns 0 for empty string', () => {
    assert.equal(estimateTokens(''), 0);
  });

  it('estimates ~1 token per 4 chars', () => {
    assert.equal(estimateTokens('abcd'), 1);
    assert.equal(estimateTokens('abcdefgh'), 2);
  });

  it('rounds up for partial chunks', () => {
    assert.equal(estimateTokens('abc'), 1);
    assert.equal(estimateTokens('abcde'), 2);
  });
});

describe('truncateToTokenBudget', () => {
  it('returns the original text when within budget', () => {
    const text = 'hello world';
    assert.equal(truncateToTokenBudget(text, 100), text);
  });

  it('truncates and inserts omission marker when over budget', () => {
    const long = 'a'.repeat(400); // ~100 tokens
    const result = truncateToTokenBudget(long, 10);
    assert.ok(result.includes('tokens omitted'), 'should include omission marker');
    assert.ok(result.length < long.length, 'result should be shorter');
  });

  it('preserves start and end of text', () => {
    const text = 'START' + 'x'.repeat(400) + 'END';
    const result = truncateToTokenBudget(text, 10);
    assert.ok(result.startsWith('START'), 'should preserve start');
    assert.ok(result.endsWith('END'), 'should preserve end');
  });
});

describe('extractSignatures', () => {
  it('extracts TypeScript function signatures', () => {
    const src = `
export function hello(name: string): string {
  return 'hello ' + name;
}
export const foo = 1;
`;
    const result = extractSignatures(src, 'typescript');
    assert.ok(result.includes('hello'), 'should include function name');
  });

  it('falls back to truncation for unknown language', () => {
    const text = 'some ruby code here';
    const result = extractSignatures(text, 'ruby');
    assert.ok(typeof result === 'string');
  });
});
