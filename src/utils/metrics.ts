interface Counter {
  name: string;
  value: number;
}

interface Timer {
  name: string;
  samples: number[];
}

class MetricsCollector {
  private counters = new Map<string, number>();
  private timers = new Map<string, number[]>();

  increment(name: string, by = 1): void {
    this.counters.set(name, (this.counters.get(name) ?? 0) + by);
  }

  recordDuration(name: string, ms: number): void {
    if (!this.timers.has(name)) {
      this.timers.set(name, []);
    }
    this.timers.get(name)!.push(ms);
  }

  time<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    this.recordDuration(name, performance.now() - start);
    return result;
  }

  async timeAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    this.recordDuration(name, performance.now() - start);
    return result;
  }

  getCounter(name: string): number {
    return this.counters.get(name) ?? 0;
  }

  getTimerStats(name: string): { avg: number; min: number; max: number; count: number } | null {
    const samples = this.timers.get(name);
    if (!samples || samples.length === 0) {
      return null;
    }
    return {
      avg: samples.reduce((a, b) => a + b, 0) / samples.length,
      min: Math.min(...samples),
      max: Math.max(...samples),
      count: samples.length,
    };
  }

  getAllCounters(): Counter[] {
    return Array.from(this.counters.entries()).map(([name, value]) => ({ name, value }));
  }

  getAllTimers(): Timer[] {
    return Array.from(this.timers.entries()).map(([name, samples]) => ({ name, samples }));
  }

  reset(): void {
    this.counters.clear();
    this.timers.clear();
  }
}

export const metrics = new MetricsCollector();
