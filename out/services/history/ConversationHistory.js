"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationHistory = void 0;
class ConversationHistory {
    conversations = new Map();
    create(title = 'New Conversation') {
        const c = { id: crypto.randomUUID(), title, messages: [], createdAt: Date.now(), updatedAt: Date.now() };
        this.conversations.set(c.id, c);
        return c;
    }
    addMessage(conversationId, msg) {
        const c = this.conversations.get(conversationId);
        if (!c)
            throw new Error('Conversation not found');
        const m = { ...msg, id: crypto.randomUUID() };
        c.messages.push(m);
        c.updatedAt = Date.now();
        return m;
    }
    get(id) { return this.conversations.get(id); }
    getAll() { return [...this.conversations.values()].sort((a, b) => b.updatedAt - a.updatedAt); }
    delete(id) { return this.conversations.delete(id); }
}
exports.ConversationHistory = ConversationHistory;
// patch 1
// patch 2
// patch 3
// patch 4
// patch 5
// patch 6
// patch 7
// patch 8
// patch 9
// patch 10
// patch 11
// patch 12
// patch 13
// patch 14
// patch 15
// patch 16
// patch 17
// patch 18
// patch 19
// patch 20
// patch 21
//# sourceMappingURL=ConversationHistory.js.map