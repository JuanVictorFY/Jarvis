"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoicePermissionChecker = void 0;
const electron_1 = require("electron");
const logger_1 = require("../utils/logger");
class VoicePermissionChecker {
    async checkMicrophonePermission() {
        if (process.platform === 'darwin') {
            const status = electron_1.systemPreferences.getMediaAccessStatus('microphone');
            logger_1.logger.info(`Microphone permission status: ${status}`, 'VoicePermissionChecker');
            return status;
        }
        // Windows and Linux: assume granted unless MediaDevices API fails
        return 'granted';
    }
    async requestMicrophonePermission() {
        if (process.platform === 'darwin') {
            const granted = await electron_1.systemPreferences.askForMediaAccess('microphone');
            logger_1.logger.info(`Microphone permission request result: ${granted}`, 'VoicePermissionChecker');
            return granted;
        }
        return true;
    }
    async ensurePermission() {
        let status = await this.checkMicrophonePermission();
        if (status === 'not-determined') {
            const granted = await this.requestMicrophonePermission();
            status = granted ? 'granted' : 'denied';
        }
        return { ok: status === 'granted', status };
    }
}
exports.VoicePermissionChecker = VoicePermissionChecker;
//# sourceMappingURL=VoicePermissionChecker.js.map