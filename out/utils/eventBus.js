"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appEvents = exports.EventBus = void 0;
class EventBus {
    listeners = new Map();
    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(handler);
        return () => this.off(event, handler);
    }
    once(event, handler) {
        const wrapper = (payload) => {
            handler(payload);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }
    off(event, handler) {
        this.listeners.get(event)?.delete(handler);
    }
    emit(event, payload) {
        this.listeners.get(event)?.forEach((handler) => {
            try {
                handler(payload);
            }
            catch {
                // individual handler errors must not crash the bus
            }
        });
    }
    removeAll(event) {
        if (event) {
            this.listeners.delete(event);
        }
        else {
            this.listeners.clear();
        }
    }
    listenerCount(event) {
        return this.listeners.get(event)?.size ?? 0;
    }
}
exports.EventBus = EventBus;
exports.appEvents = new EventBus();
//# sourceMappingURL=eventBus.js.map