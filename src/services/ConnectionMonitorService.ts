import https from 'https';
import { EventBus } from '../utils/eventBus';

export type ConnectionStatus = 'online' | 'offline' | 'checking';

export class ConnectionMonitorService {
  private status: ConnectionStatus = 'checking';
  private readonly bus = new EventBus();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly checkUrl = 'https://api.anthropic.com';
  private readonly checkIntervalMs = 30_000;

  start(): void {
    if (this.intervalId !== null) {
      return;
    }
    void this.check();
    this.intervalId = setInterval(() => { void this.check(); }, this.checkIntervalMs);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  isOnline(): boolean {
    return this.status === 'online';
  }

  onStatusChange(handler: (status: ConnectionStatus) => void): () => void {
    return this.bus.on('status:change', handler);
  }

  async check(): Promise<ConnectionStatus> {
    const previous = this.status;
    this.status = 'checking';

    const result = await this.probe();
    this.status = result ? 'online' : 'offline';

    if (this.status !== previous) {
      this.bus.emit('status:change', this.status);
    }

    return this.status;
  }

  private probe(): Promise<boolean> {
    return new Promise((resolve) => {
      const req = https.get(this.checkUrl, { timeout: 5_000 }, (res) => {
        resolve(res.statusCode !== undefined && res.statusCode < 500);
        res.destroy();
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
    });
  }
}
