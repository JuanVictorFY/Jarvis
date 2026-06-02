"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderSwitcher = void 0;
const eventBus_1 = require("../utils/eventBus");
const logger_1 = require("../utils/logger");
class ProviderSwitcher {
    factory;
    configService;
    currentProvider;
    constructor(factory, configService) {
        this.factory = factory;
        this.configService = configService;
        this.currentProvider = configService.getConfig().activeProvider;
    }
    getActiveProvider() {
        return this.factory.getProvider(this.currentProvider);
    }
    getActiveProviderType() {
        return this.currentProvider;
    }
    getActiveModel() {
        return this.configService.getActiveModel();
    }
    async switchTo(provider, model) {
        const previous = this.currentProvider;
        if (!this.factory.getProvider(provider).isConfigured()) {
            throw new Error(`Provider "${provider}" is not configured. Please add an API key in settings.`);
        }
        this.configService.setActiveProvider(provider);
        if (model) {
            this.configService.setModel(provider, model);
        }
        this.currentProvider = provider;
        const event = {
            from: previous,
            to: provider,
            model: this.configService.getActiveModel(),
        };
        eventBus_1.appEvents.emit('provider:switched', event);
        logger_1.logger.info(`Provider switched: ${previous} -> ${provider} (model: ${event.model})`, 'ProviderSwitcher');
    }
    canSwitchTo(provider) {
        return this.factory.getProvider(provider).isConfigured();
    }
}
exports.ProviderSwitcher = ProviderSwitcher;
//# sourceMappingURL=ProviderSwitcher.js.map