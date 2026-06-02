"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const ConversationHistory_1 = require("../services/history/ConversationHistory");
(0, node_test_1.describe)('ConversationHistory', () => {
    let history;
    (0, node_test_1.beforeEach)(() => {
        history = new ConversationHistory_1.ConversationHistory();
    });
    (0, node_test_1.it)('creates a conversation with a default title', () => {
        const c = history.create();
        strict_1.default.ok(c.id, 'should have id');
        strict_1.default.equal(c.title, 'New Conversation');
        strict_1.default.equal(c.messages.length, 0);
    });
    (0, node_test_1.it)('creates with a custom title', () => {
        const c = history.create('My chat');
        strict_1.default.equal(c.title, 'My chat');
    });
    (0, node_test_1.it)('adds a message to a conversation', () => {
        const c = history.create();
        const msg = history.addMessage(c.id, { role: 'user', content: 'Hello', timestamp: Date.now() });
        strict_1.default.equal(msg.content, 'Hello');
        strict_1.default.ok(msg.id, 'message should have id');
        strict_1.default.equal(history.get(c.id)?.messages.length, 1);
    });
    (0, node_test_1.it)('throws when adding to a nonexistent conversation', () => {
        strict_1.default.throws(() => history.addMessage('bad-id', { role: 'user', content: 'x', timestamp: Date.now() }), /not found/i);
    });
    (0, node_test_1.it)('getAll returns conversations sorted by updatedAt desc', async () => {
        const c1 = history.create('First');
        await new Promise(r => setTimeout(r, 5));
        const c2 = history.create('Second');
        const all = history.getAll();
        strict_1.default.equal(all[0].id, c2.id, 'most recently updated first');
        strict_1.default.equal(all[1].id, c1.id);
    });
    (0, node_test_1.it)('deletes a conversation', () => {
        const c = history.create();
        strict_1.default.ok(history.delete(c.id));
        strict_1.default.equal(history.get(c.id), undefined);
    });
    (0, node_test_1.it)('delete returns false for unknown id', () => {
        strict_1.default.equal(history.delete('ghost'), false);
    });
});
//# sourceMappingURL=conversationHistory.test.js.map