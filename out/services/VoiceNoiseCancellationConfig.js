"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUDIO_PRESETS = void 0;
exports.getAudioConstraints = getAudioConstraints;
exports.buildMediaConstraints = buildMediaConstraints;
exports.AUDIO_PRESETS = {
    balanced: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
    },
    highQuality: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: false,
        sampleRate: 48000,
        channelCount: 1,
    },
    minimal: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
    },
};
function getAudioConstraints(preset = 'balanced') {
    return { ...exports.AUDIO_PRESETS[preset] };
}
function buildMediaConstraints(preset = 'balanced') {
    return { audio: getAudioConstraints(preset), video: false };
}
//# sourceMappingURL=VoiceNoiseCancellationConfig.js.map