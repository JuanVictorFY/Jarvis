type EventHandler<T = unknown> = (payload: T) => void;

export class EventBus {
  private readonly listeners = new Map<string, Set<EventHandler>>();

  on<T>(event: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as EventHandler);

    return () => this.off(event, handler);
  }

  once<T>(event: string, handler: EventHandler<T>): void {
    const wrapper: EventHandler<T> = (payload) => {
      handler(payload);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  off<T>(event: string, handler: EventHandler<T>): void {
    this.listeners.get(event)?.delete(handler as EventHandler);
  }

  emit<T>(event: string, payload: T): void {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        handler(payload);
      } catch {
        // individual handler errors must not crash the bus
      }
    });
  }

  removeAll(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

export const appEvents = new EventBus();
