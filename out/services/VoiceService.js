"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceService = void 0;
const electron_1 = require("electron");
const channels_1 = require("../ipc/channels");
const voice_1 = require("../types/voice");
const logger_1 = require("../utils/logger");
class VoiceService {
    config = { ...voice_1.DEFAULT_VOICE_CONFIG };
    window;
    constructor(window) {
        this.window = window;
        this.registerHandlers();
    }
    registerHandlers() {
        electron_1.ipcMain.handle(channels_1.Channel.VOICE_START, async () => {
            if (!this.config.enabled) {
                return { success: false, error: 'Voice recognition is disabled in settings' };
            }
            this.window.webContents.send(channels_1.Channel.VOICE_START);
            logger_1.logger.info('Voice recognition started', 'VoiceService');
            return { success: true };
        });
        electron_1.ipcMain.handle(channels_1.Channel.VOICE_STOP, async () => {
            this.window.webContents.send(channels_1.Channel.VOICE_STOP);
            logger_1.logger.info('Voice recognition stopped', 'VoiceService');
            return { success: true };
        });
        electron_1.ipcMain.on(channels_1.Channel.VOICE_RESULT, (_event, transcript) => {
            logger_1.logger.debug(`Voice transcript: "${transcript.text}"`, 'VoiceService');
        });
        electron_1.ipcMain.on(channels_1.Channel.VOICE_ERROR, (_event, error) => {
            logger_1.logger.error(`Voice error: ${error.message}`, 'VoiceService');
        });
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    getConfig() {
        return { ...this.config };
    }
    isEnabled() {
        return this.config.enabled;
    }
}
exports.VoiceService = VoiceService;
//# sourceMappingURL=VoiceService.js.map