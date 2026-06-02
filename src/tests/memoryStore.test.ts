import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MemoryStore } from '../services/memory/MemoryStore';

describe('MemoryStore', () => {
  let store: MemoryStore;

  beforeEach(() => {
    store = new MemoryStore();
  });

  it('sets and gets a value', () => {
    store.set('name', 'Jarvis');
    assert.equal(store.get('name'), 'Jarvis');
  });

  it('returns undefined for missing keys', () => {
    assert.equal(store.get('nonexistent'), undefined);
  });

  it('overwrites existing keys and updates updatedAt', async () => {
    store.set('key', 'v1');
    const e1 = store.set('key', 'v1');
    await new Promise(r => setTimeout(r, 5));
    const e2 = store.set('key', 'v2');
    assert.equal(store.get('key'), 'v2');
    assert.equal(e1.id, e2.id, 'id should be stable across updates');
    assert.ok(e2.updatedAt >= e1.updatedAt, 'updatedAt should advance');
  });

  it('deletes a key', () => {
    store.set('x', 1);
    const ok = store.delete('x');
    assert.ok(ok);
    assert.equal(store.get('x'), undefined);
  });

  it('delete returns false for missing key', () => {
    assert.equal(store.delete('ghost'), false);
  });

  it('all() returns every entry', () => {
    store.set('a', 1);
    store.set('b', 2);
    store.set('c', 3);
    const all = store.all();
    assert.equal(all.length, 3);
    assert.ok(all.some(e => e.key === 'a'));
    assert.ok(all.some(e => e.key === 'b'));
    assert.ok(all.some(e => e.key === 'c'));
  });

  it('stores complex values', () => {
    const val = { nested: { list: [1, 2, 3] } };
    store.set('obj', val);
    assert.deepEqual(store.get('obj'), val);
  });
});
