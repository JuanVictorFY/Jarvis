"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerProviderHandlers = registerProviderHandlers;
const electron_1 = require("electron");
const ProviderHealthChecker_1 = require("../providers/ProviderHealthChecker");
const logger_1 = require("../utils/logger");
function registerProviderHandlers(factory, configService) {
    const healthChecker = new ProviderHealthChecker_1.ProviderHealthChecker();
    electron_1.ipcMain.handle('providers:list', () => {
        return factory.listProviders().map((p) => ({
            id: p.id,
            name: p.name,
            models: p.availableModels,
            configured: p.isConfigured(),
        }));
    });
    electron_1.ipcMain.handle('providers:get-config', () => {
        return configService.getConfig();
    });
    electron_1.ipcMain.handle('providers:set-active', (_event, provider) => {
        configService.setActiveProvider(provider);
        logger_1.logger.info(`Active provider changed to: ${provider}`, 'providerHandlers');
        return { success: true };
    });
    electron_1.ipcMain.handle('providers:set-api-key', (_event, provider, key) => {
        configService.setApiKey(provider, key);
        factory.updateCredentials({ [`${provider}ApiKey`]: key });
        return { success: true };
    });
    electron_1.ipcMain.handle('providers:set-model', (_event, provider, model) => {
        configService.setModel(provider, model);
        return { success: true };
    });
    electron_1.ipcMain.handle('providers:health-check', async (_event, provider) => {
        const p = factory.getProvider(provider);
        const key = configService.getApiKey(provider);
        return healthChecker.checkProvider(provider, p, key);
    });
    electron_1.ipcMain.handle('providers:get-models', (_event, provider) => {
        return factory.getProvider(provider).availableModels;
    });
}
//# sourceMappingURL=providerHandlers.js.map