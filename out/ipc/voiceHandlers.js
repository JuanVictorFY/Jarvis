"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerVoiceHandlers = registerVoiceHandlers;
const electron_1 = require("electron");
const channels_1 = require("./channels");
const logger_1 = require("../utils/logger");
function registerVoiceHandlers(voiceService, settingsService) {
    electron_1.ipcMain.handle('voice:get-config', () => {
        return settingsService.getConfig();
    });
    electron_1.ipcMain.handle('voice:update-config', (_event, partial) => {
        settingsService.update(partial);
        voiceService.updateConfig(settingsService.getConfig());
        logger_1.logger.info('Voice config updated', 'voiceHandlers');
        return { success: true };
    });
    electron_1.ipcMain.handle('voice:get-languages', () => {
        return settingsService.getSupportedLanguages();
    });
    electron_1.ipcMain.handle('voice:is-enabled', () => {
        return voiceService.isEnabled();
    });
    electron_1.ipcMain.handle(channels_1.Channel.VOICE_START, async () => {
        if (!voiceService.isEnabled()) {
            return { success: false, error: 'Voice recognition is disabled' };
        }
        logger_1.logger.info('Voice recognition requested', 'voiceHandlers');
        return { success: true };
    });
    electron_1.ipcMain.handle(channels_1.Channel.VOICE_STOP, async () => {
        logger_1.logger.info('Voice recognition stop requested', 'voiceHandlers');
        return { success: true };
    });
}
//# sourceMappingURL=voiceHandlers.js.map