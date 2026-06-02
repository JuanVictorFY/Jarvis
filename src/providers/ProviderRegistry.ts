import type { AIProvider } from './AIProvider';

export class ProviderRegistry {
  private readonly registered = new Map<string, AIProvider>();

  register(provider: AIProvider): void {
    this.registered.set(provider.id, provider);
  }

  unregister(id: string): void {
    this.registered.delete(id);
  }

  get(id: string): AIProvider | undefined {
    return this.registered.get(id);
  }

  has(id: string): boolean {
    return this.registered.has(id);
  }

  list(): AIProvider[] {
    return Array.from(this.registered.values());
  }

  listConfigured(): AIProvider[] {
    return this.list().filter((p) => p.isConfigured());
  }

  ids(): string[] {
    return Array.from(this.registered.keys());
  }

  count(): number {
    return this.registered.size;
  }
}

export const globalProviderRegistry = new ProviderRegistry();
