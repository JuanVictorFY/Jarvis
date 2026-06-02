"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEMPERATURE_PRESETS = void 0;
exports.getTemperatureConfig = getTemperatureConfig;
exports.validateTemperature = validateTemperature;
exports.describeTemperature = describeTemperature;
exports.TEMPERATURE_PRESETS = {
    precise: { value: 0.1, topP: 0.9 },
    balanced: { value: 0.7, topP: 0.95 },
    creative: { value: 1.0, topP: 1.0 },
    random: { value: 1.5, topP: 1.0 },
};
function getTemperatureConfig(preset) {
    return { ...exports.TEMPERATURE_PRESETS[preset] };
}
function validateTemperature(value) {
    return value >= 0 && value <= 2;
}
function describeTemperature(value) {
    if (value <= 0.2) {
        return 'Very precise and deterministic';
    }
    if (value <= 0.5) {
        return 'Focused and consistent';
    }
    if (value <= 0.8) {
        return 'Balanced creativity and accuracy';
    }
    if (value <= 1.2) {
        return 'Creative and varied';
    }
    return 'Highly random and experimental';
}
//# sourceMappingURL=TemperatureConfig.js.map