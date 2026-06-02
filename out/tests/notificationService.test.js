"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const NotificationService_1 = require("../services/notifications/NotificationService");
(0, node_test_1.describe)('NotificationService', () => {
    let svc;
    (0, node_test_1.beforeEach)(() => {
        svc = new NotificationService_1.NotificationService();
    });
    (0, node_test_1.it)('sends a notification and returns it', () => {
        const n = svc.send('Title', 'Body', 'info');
        strict_1.default.equal(n.title, 'Title');
        strict_1.default.equal(n.body, 'Body');
        strict_1.default.equal(n.level, 'info');
        strict_1.default.equal(n.read, false);
        strict_1.default.ok(n.id, 'should have an id');
    });
    (0, node_test_1.it)('getAll returns all notifications', () => {
        svc.send('A', 'a');
        svc.send('B', 'b');
        strict_1.default.equal(svc.getAll().length, 2);
    });
    (0, node_test_1.it)('getUnread filters out read notifications', () => {
        const n1 = svc.send('Read me', 'x');
        svc.send('Keep me', 'y');
        svc.markRead(n1.id);
        strict_1.default.equal(svc.getUnread().length, 1);
    });
    (0, node_test_1.it)('markRead sets read=true', () => {
        const n = svc.send('T', 'B');
        strict_1.default.equal(n.read, false);
        svc.markRead(n.id);
        const updated = svc.getAll().find(x => x.id === n.id);
        strict_1.default.equal(updated?.read, true);
    });
    (0, node_test_1.it)('fires onNotification listener', () => {
        let fired = false;
        const unsub = svc.onNotification(() => { fired = true; });
        svc.send('T', 'B');
        strict_1.default.ok(fired);
        unsub();
    });
    (0, node_test_1.it)('unsubscribed listener does not fire', () => {
        let count = 0;
        const unsub = svc.onNotification(() => { count++; });
        unsub();
        svc.send('T', 'B');
        strict_1.default.equal(count, 0);
    });
    (0, node_test_1.it)('defaults level to info', () => {
        const n = svc.send('T', 'B');
        strict_1.default.equal(n.level, 'info');
    });
});
//# sourceMappingURL=notificationService.test.js.map