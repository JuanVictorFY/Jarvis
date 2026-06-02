export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  tokens?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export class ConversationHistory {
  private conversations = new Map<string, Conversation>();

  create(title = 'New Conversation'): Conversation {
    const c: Conversation = { id: crypto.randomUUID(), title, messages: [], createdAt: Date.now(), updatedAt: Date.now() };
    this.conversations.set(c.id, c);
    return c;
  }

  addMessage(conversationId: string, msg: Omit<Message, 'id'>): Message {
    const c = this.conversations.get(conversationId);
    if (!c) throw new Error('Conversation not found');
    const m: Message = { ...msg, id: crypto.randomUUID() };
    c.messages.push(m);
    c.updatedAt = Date.now();
    return m;
  }

  get(id: string): Conversation | undefined { return this.conversations.get(id); }
  getAll(): Conversation[] { return [...this.conversations.values()].sort((a, b) => b.updatedAt - a.updatedAt); }
  delete(id: string): boolean { return this.conversations.delete(id); }
}
// patch 1
// patch 2
// patch 3
// patch 4
// patch 5
// patch 6
