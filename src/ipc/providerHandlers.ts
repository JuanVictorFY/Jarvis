import { ipcMain } from 'electron';
import type { ProviderFactory } from '../providers/ProviderFactory';
import type { ProviderConfigService } from '../providers/ProviderConfigService';
import { ProviderHealthChecker } from '../providers/ProviderHealthChecker';
import type { ProviderType } from '../types/config';
import { logger } from '../utils/logger';

export function registerProviderHandlers(
  factory: ProviderFactory,
  configService: ProviderConfigService
): void {
  const healthChecker = new ProviderHealthChecker();

  ipcMain.handle('providers:list', () => {
    return factory.listProviders().map((p) => ({
      id: p.id,
      name: p.name,
      models: p.availableModels,
      configured: p.isConfigured(),
    }));
  });

  ipcMain.handle('providers:get-config', () => {
    return configService.getConfig();
  });

  ipcMain.handle('providers:set-active', (_event, provider: ProviderType) => {
    configService.setActiveProvider(provider);
    logger.info(`Active provider changed to: ${provider}`, 'providerHandlers');
    return { success: true };
  });

  ipcMain.handle('providers:set-api-key', (_event, provider: ProviderType, key: string) => {
    configService.setApiKey(provider, key);
    factory.updateCredentials({ [`${provider}ApiKey`]: key } as Record<string, string>);
    return { success: true };
  });

  ipcMain.handle('providers:set-model', (_event, provider: ProviderType, model: string) => {
    configService.setModel(provider, model);
    return { success: true };
  });

  ipcMain.handle('providers:health-check', async (_event, provider: ProviderType) => {
    const p = factory.getProvider(provider);
    const key = configService.getApiKey(provider);
    return healthChecker.checkProvider(provider, p, key);
  });

  ipcMain.handle('providers:get-models', (_event, provider: ProviderType) => {
    return factory.getProvider(provider).availableModels;
  });
}
