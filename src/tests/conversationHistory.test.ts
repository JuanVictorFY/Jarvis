import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConversationHistory } from '../services/history/ConversationHistory';

describe('ConversationHistory', () => {
  let history: ConversationHistory;

  beforeEach(() => {
    history = new ConversationHistory();
  });

  it('creates a conversation with a default title', () => {
    const c = history.create();
    assert.ok(c.id, 'should have id');
    assert.equal(c.title, 'New Conversation');
    assert.equal(c.messages.length, 0);
  });

  it('creates with a custom title', () => {
    const c = history.create('My chat');
    assert.equal(c.title, 'My chat');
  });

  it('adds a message to a conversation', () => {
    const c = history.create();
    const msg = history.addMessage(c.id, { role: 'user', content: 'Hello', timestamp: Date.now() });
    assert.equal(msg.content, 'Hello');
    assert.ok(msg.id, 'message should have id');
    assert.equal(history.get(c.id)?.messages.length, 1);
  });

  it('throws when adding to a nonexistent conversation', () => {
    assert.throws(
      () => history.addMessage('bad-id', { role: 'user', content: 'x', timestamp: Date.now() }),
      /not found/i,
    );
  });

  it('getAll returns conversations sorted by updatedAt desc', async () => {
    const c1 = history.create('First');
    await new Promise(r => setTimeout(r, 5));
    const c2 = history.create('Second');
    const all = history.getAll();
    assert.equal(all[0]!.id, c2.id, 'most recently updated first');
    assert.equal(all[1]!.id, c1.id);
  });

  it('deletes a conversation', () => {
    const c = history.create();
    assert.ok(history.delete(c.id));
    assert.equal(history.get(c.id), undefined);
  });

  it('delete returns false for unknown id', () => {
    assert.equal(history.delete('ghost'), false);
  });
});
