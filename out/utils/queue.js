"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncQueue = void 0;
class AsyncQueue {
    queue = [];
    running = false;
    enqueue(task) {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    resolve(await task());
                }
                catch (err) {
                    reject(err);
                }
            });
            if (!this.running) {
                void this.drain();
            }
        });
    }
    async drain() {
        this.running = true;
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            await task();
        }
        this.running = false;
    }
    get size() {
        return this.queue.length;
    }
    get isRunning() {
        return this.running;
    }
    clear() {
        this.queue.length = 0;
    }
}
exports.AsyncQueue = AsyncQueue;
//# sourceMappingURL=queue.js.map