"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
class NotificationService {
    notifications = [];
    listeners = [];
    send(title, body, level = 'info') {
        const n = { id: crypto.randomUUID(), title, body, level, createdAt: Date.now(), read: false };
        this.notifications.unshift(n);
        this.listeners.forEach(l => l(n));
        return n;
    }
    markRead(id) {
        const n = this.notifications.find(x => x.id === id);
        if (n)
            n.read = true;
    }
    onNotification(cb) {
        this.listeners.push(cb);
        return () => { this.listeners = this.listeners.filter(l => l !== cb); };
    }
    getAll() { return [...this.notifications]; }
    getUnread() { return this.notifications.filter(n => !n.read); }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=NotificationService.js.map