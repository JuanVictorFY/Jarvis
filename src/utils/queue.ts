type Task<T> = () => Promise<T>;

export class AsyncQueue {
  private readonly queue: Array<() => Promise<void>> = [];
  private running = false;

  enqueue<T>(task: Task<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          resolve(await task());
        } catch (err) {
          reject(err);
        }
      });
      if (!this.running) {
        void this.drain();
      }
    });
  }

  private async drain(): Promise<void> {
    this.running = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      await task();
    }
    this.running = false;
  }

  get size(): number {
    return this.queue.length;
  }

  get isRunning(): boolean {
    return this.running;
  }

  clear(): void {
    this.queue.length = 0;
  }
}
