export class RateLimiter {
  private timestamps: number[] = [];

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number
  ) {}

  canProceed(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    return this.timestamps.length < this.maxRequests;
  }

  record(): void {
    this.timestamps.push(Date.now());
  }

  tryAcquire(): boolean {
    if (this.canProceed()) {
      this.record();
      return true;
    }
    return false;
  }

  msUntilNextSlot(): number {
    if (this.canProceed()) {
      return 0;
    }
    const oldest = this.timestamps[0];
    if (oldest === undefined) {
      return 0;
    }
    return this.windowMs - (Date.now() - oldest);
  }

  reset(): void {
    this.timestamps = [];
  }
}
