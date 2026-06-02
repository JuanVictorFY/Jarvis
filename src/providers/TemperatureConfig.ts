export type TemperaturePreset = 'precise' | 'balanced' | 'creative' | 'random';

export interface TemperatureConfig {
  value: number;
  topP?: number;
  topK?: number;
}

export const TEMPERATURE_PRESETS: Record<TemperaturePreset, TemperatureConfig> = {
  precise: { value: 0.1, topP: 0.9 },
  balanced: { value: 0.7, topP: 0.95 },
  creative: { value: 1.0, topP: 1.0 },
  random: { value: 1.5, topP: 1.0 },
};

export function getTemperatureConfig(preset: TemperaturePreset): TemperatureConfig {
  return { ...TEMPERATURE_PRESETS[preset] };
}

export function validateTemperature(value: number): boolean {
  return value >= 0 && value <= 2;
}

export function describeTemperature(value: number): string {
  if (value <= 0.2) { return 'Very precise and deterministic'; }
  if (value <= 0.5) { return 'Focused and consistent'; }
  if (value <= 0.8) { return 'Balanced creativity and accuracy'; }
  if (value <= 1.2) { return 'Creative and varied'; }
  return 'Highly random and experimental';
}
