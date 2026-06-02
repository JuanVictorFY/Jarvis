"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const MemoryStore_1 = require("../services/memory/MemoryStore");
(0, node_test_1.describe)('MemoryStore', () => {
    let store;
    (0, node_test_1.beforeEach)(() => {
        store = new MemoryStore_1.MemoryStore();
    });
    (0, node_test_1.it)('sets and gets a value', () => {
        store.set('name', 'Jarvis');
        strict_1.default.equal(store.get('name'), 'Jarvis');
    });
    (0, node_test_1.it)('returns undefined for missing keys', () => {
        strict_1.default.equal(store.get('nonexistent'), undefined);
    });
    (0, node_test_1.it)('overwrites existing keys and updates updatedAt', async () => {
        store.set('key', 'v1');
        const e1 = store.set('key', 'v1');
        await new Promise(r => setTimeout(r, 5));
        const e2 = store.set('key', 'v2');
        strict_1.default.equal(store.get('key'), 'v2');
        strict_1.default.equal(e1.id, e2.id, 'id should be stable across updates');
        strict_1.default.ok(e2.updatedAt >= e1.updatedAt, 'updatedAt should advance');
    });
    (0, node_test_1.it)('deletes a key', () => {
        store.set('x', 1);
        const ok = store.delete('x');
        strict_1.default.ok(ok);
        strict_1.default.equal(store.get('x'), undefined);
    });
    (0, node_test_1.it)('delete returns false for missing key', () => {
        strict_1.default.equal(store.delete('ghost'), false);
    });
    (0, node_test_1.it)('all() returns every entry', () => {
        store.set('a', 1);
        store.set('b', 2);
        store.set('c', 3);
        const all = store.all();
        strict_1.default.equal(all.length, 3);
        strict_1.default.ok(all.some(e => e.key === 'a'));
        strict_1.default.ok(all.some(e => e.key === 'b'));
        strict_1.default.ok(all.some(e => e.key === 'c'));
    });
    (0, node_test_1.it)('stores complex values', () => {
        const val = { nested: { list: [1, 2, 3] } };
        store.set('obj', val);
        strict_1.default.deepEqual(store.get('obj'), val);
    });
});
//# sourceMappingURL=memoryStore.test.js.map