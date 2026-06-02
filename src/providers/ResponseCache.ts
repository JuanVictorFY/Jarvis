import { sha256 } from '../utils/hash';
import { TTLCache } from '../utils/cache';

export interface CachedResponse {
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedAt: Date;
}

export class ResponseCache {
  private readonly cache: TTLCache<string, CachedResponse>;
  private hits = 0;
  private misses = 0;

  constructor(ttlMs = 300_000, private readonly maxEntries = 100) {
    this.cache = new TTLCache<string, CachedResponse>(ttlMs);
  }

  private buildKey(prompt: string, model: string, systemPrompt?: string): string {
    return sha256(`${model}|${systemPrompt ?? ''}|${prompt}`);
  }

  get(prompt: string, model: string, systemPrompt?: string): CachedResponse | undefined {
    const key = this.buildKey(prompt, model, systemPrompt);
    const result = this.cache.get(key);
    if (result) {
      this.hits++;
    } else {
      this.misses++;
    }
    return result;
  }

  set(
    prompt: string,
    model: string,
    response: Omit<CachedResponse, 'cachedAt'>,
    systemPrompt?: string
  ): void {
    const key = this.buildKey(prompt, model, systemPrompt);
    this.cache.set(key, { ...response, cachedAt: new Date() });
  }

  getStats(): { hits: number; misses: number; hitRate: number; size: number } {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total === 0 ? 0 : this.hits / total,
      size: this.cache.size,
    };
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
}
