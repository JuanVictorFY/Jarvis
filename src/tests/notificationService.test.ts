import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NotificationService } from '../services/notifications/NotificationService';

describe('NotificationService', () => {
  let svc: NotificationService;

  beforeEach(() => {
    svc = new NotificationService();
  });

  it('sends a notification and returns it', () => {
    const n = svc.send('Title', 'Body', 'info');
    assert.equal(n.title, 'Title');
    assert.equal(n.body, 'Body');
    assert.equal(n.level, 'info');
    assert.equal(n.read, false);
    assert.ok(n.id, 'should have an id');
  });

  it('getAll returns all notifications', () => {
    svc.send('A', 'a');
    svc.send('B', 'b');
    assert.equal(svc.getAll().length, 2);
  });

  it('getUnread filters out read notifications', () => {
    const n1 = svc.send('Read me', 'x');
    svc.send('Keep me', 'y');
    svc.markRead(n1.id);
    assert.equal(svc.getUnread().length, 1);
  });

  it('markRead sets read=true', () => {
    const n = svc.send('T', 'B');
    assert.equal(n.read, false);
    svc.markRead(n.id);
    const updated = svc.getAll().find(x => x.id === n.id);
    assert.equal(updated?.read, true);
  });

  it('fires onNotification listener', () => {
    let fired = false;
    const unsub = svc.onNotification(() => { fired = true; });
    svc.send('T', 'B');
    assert.ok(fired);
    unsub();
  });

  it('unsubscribed listener does not fire', () => {
    let count = 0;
    const unsub = svc.onNotification(() => { count++; });
    unsub();
    svc.send('T', 'B');
    assert.equal(count, 0);
  });

  it('defaults level to info', () => {
    const n = svc.send('T', 'B');
    assert.equal(n.level, 'info');
  });
});
