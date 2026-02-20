export const CHANNELS = ['emg1', 'emg2', 'emg3', 'emg4', 'angle'] as const;

export type ChannelKey = (typeof CHANNELS)[number];

export const CHANNEL_COLORS: Record<ChannelKey, string> = {
  emg1: '#2563eb',
  emg2: '#059669',
  emg3: '#d97706',
  emg4: '#dc2626',
  angle: '#7c3aed',
} as const;
