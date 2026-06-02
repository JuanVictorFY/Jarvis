export type NotifLevel = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  body: string;
  level: NotifLevel;
  createdAt: number;
  read: boolean;
}

export class NotificationService {
  private notifications: Notification[] = [];
  private listeners: Array<(n: Notification) => void> = [];

  send(title: string, body: string, level: NotifLevel = 'info'): Notification {
    const n: Notification = { id: crypto.randomUUID(), title, body, level, createdAt: Date.now(), read: false };
    this.notifications.unshift(n);
    this.listeners.forEach(l => l(n));
    return n;
  }

  markRead(id: string): void {
    const n = this.notifications.find(x => x.id === id);
    if (n) n.read = true;
  }

  onNotification(cb: (n: Notification) => void): () => void {
    this.listeners.push(cb);
    return () => { this.listeners = this.listeners.filter(l => l !== cb); };
  }

  getAll(): Notification[] { return [...this.notifications]; }
  getUnread(): Notification[] { return this.notifications.filter(n => !n.read); }
}
