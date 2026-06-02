export interface AIProvider {
  id: string;
  name: string;
  models: string[];
  chat(messages: Array<{role: string; content: string}>, model: string): AsyncIterable<string>;
}

export class ProviderRegistry {
  private providers = new Map<string, AIProvider>();
  private activeId: string | null = null;

  register(provider: AIProvider): void { this.providers.set(provider.id, provider); }
  setActive(id: string): void { if (!this.providers.has(id)) throw new Error(`Unknown provider: ${id}`); this.activeId = id; }
  getActive(): AIProvider | null { return this.activeId ? (this.providers.get(this.activeId) ?? null) : null; }
  list(): AIProvider[] { return [...this.providers.values()]; }
}
// patch 1
// patch 2
// patch 3
// patch 4
// patch 5
// patch 6
// patch 7
// patch 8
// patch 9
// patch 10
// patch 11
// patch 12
// patch 13
// patch 14
// patch 15
// patch 16
// patch 17
// patch 18
// patch 19
// patch 20
// patch 21
// patch 22
