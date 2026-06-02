import type { AIProvider } from './AIProvider';
import type { ProviderFactory } from './ProviderFactory';
import type { ProviderConfigService } from './ProviderConfigService';
import type { ProviderType } from '../types/config';
import { appEvents } from '../utils/eventBus';
import { logger } from '../utils/logger';

export interface ProviderSwitchEvent {
  from: ProviderType;
  to: ProviderType;
  model: string;
}

export class ProviderSwitcher {
  private currentProvider: ProviderType;

  constructor(
    private readonly factory: ProviderFactory,
    private readonly configService: ProviderConfigService
  ) {
    this.currentProvider = configService.getConfig().activeProvider;
  }

  getActiveProvider(): AIProvider {
    return this.factory.getProvider(this.currentProvider);
  }

  getActiveProviderType(): ProviderType {
    return this.currentProvider;
  }

  getActiveModel(): string {
    return this.configService.getActiveModel();
  }

  async switchTo(provider: ProviderType, model?: string): Promise<void> {
    const previous = this.currentProvider;

    if (!this.factory.getProvider(provider).isConfigured()) {
      throw new Error(`Provider "${provider}" is not configured. Please add an API key in settings.`);
    }

    this.configService.setActiveProvider(provider);
    if (model) {
      this.configService.setModel(provider, model);
    }

    this.currentProvider = provider;

    const event: ProviderSwitchEvent = {
      from: previous,
      to: provider,
      model: this.configService.getActiveModel(),
    };

    appEvents.emit('provider:switched', event);
    logger.info(
      `Provider switched: ${previous} -> ${provider} (model: ${event.model})`,
      'ProviderSwitcher'
    );
  }

  canSwitchTo(provider: ProviderType): boolean {
    return this.factory.getProvider(provider).isConfigured();
  }
}
