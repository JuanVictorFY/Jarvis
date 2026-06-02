import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import type { JarvisConfig } from '../types/index';

const DEFAULTS: JarvisConfig = {
  anthropicApiKey: '',
  model: 'llama3.2',
  maxTokens: 8192,
  openaiApiKey: '',
  geminiApiKey: '',
  ollamaBaseUrl: 'http://localhost:11434',
  defaultProvider: 'ollama',
  theme: 'dark',
};

export class ConfigService {
  private readonly configPath: string;
  private config: JarvisConfig;

  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'jarvis-config.json');
    this.config = this.load();
  }

  private load(): JarvisConfig {
    try {
      const raw = fs.readFileSync(this.configPath, 'utf8');
      return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<JarvisConfig>) };
    } catch {
      return { ...DEFAULTS };
    }
  }

  public get(): JarvisConfig {
    return { ...this.config };
  }

  public update(partial: Partial<JarvisConfig>): void {
    this.config = { ...this.config, ...partial };
    fs.mkdirSync(path.dirname(this.configPath), { recursive: true });
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf8');
  }
}
