import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import type { ProviderType } from '../types/config';

export interface ProviderConfig {
  activeProvider: ProviderType;
  models: Record<ProviderType, string>;
  apiKeys: Record<ProviderType, string>;
}

const DEFAULTS: ProviderConfig = {
  activeProvider: 'anthropic',
  models: {
    anthropic: 'claude-sonnet-4-6',
    openai: 'gpt-4o',
    gemini: 'gemini-2.0-flash',
  },
  apiKeys: {
    anthropic: '',
    openai: '',
    gemini: '',
  },
};

export class ProviderConfigService {
  private readonly filePath: string;
  private config: ProviderConfig = { ...DEFAULTS };

  constructor() {
    this.filePath = path.join(app.getPath('userData'), 'provider-config.json');
    this.load();
  }

  private load(): void {
    try {
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<ProviderConfig>;
      this.config = {
        activeProvider: parsed.activeProvider ?? DEFAULTS.activeProvider,
        models: { ...DEFAULTS.models, ...parsed.models },
        apiKeys: { ...DEFAULTS.apiKeys, ...parsed.apiKeys },
      };
    } catch {
      this.config = JSON.parse(JSON.stringify(DEFAULTS)) as ProviderConfig;
    }
  }

  private save(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.config, null, 2));
    } catch { /* non-critical */ }
  }

  getConfig(): ProviderConfig {
    return JSON.parse(JSON.stringify(this.config)) as ProviderConfig;
  }

  setActiveProvider(provider: ProviderType): void {
    this.config.activeProvider = provider;
    this.save();
  }

  setApiKey(provider: ProviderType, key: string): void {
    this.config.apiKeys[provider] = key;
    this.save();
  }

  setModel(provider: ProviderType, model: string): void {
    this.config.models[provider] = model;
    this.save();
  }

  getActiveModel(): string {
    return this.config.models[this.config.activeProvider];
  }

  getApiKey(provider: ProviderType): string {
    return this.config.apiKeys[provider];
  }
}
