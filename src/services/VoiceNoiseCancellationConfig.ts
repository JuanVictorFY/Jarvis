export interface AudioConstraints {
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  sampleRate?: number;
  channelCount?: number;
}

export const AUDIO_PRESETS = {
  balanced: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  } satisfies AudioConstraints,

  highQuality: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: false,
    sampleRate: 48000,
    channelCount: 1,
  } satisfies AudioConstraints,

  minimal: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  } satisfies AudioConstraints,
} as const;

export type AudioPreset = keyof typeof AUDIO_PRESETS;

export function getAudioConstraints(preset: AudioPreset = 'balanced'): AudioConstraints {
  return { ...AUDIO_PRESETS[preset] };
}

export function buildMediaConstraints(preset: AudioPreset = 'balanced'): MediaStreamConstraints {
  return { audio: getAudioConstraints(preset), video: false };
}
