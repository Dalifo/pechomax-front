export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ||
  'https://pechomax.striffe.dev';

export const API_TIMEOUT_MS = 15000;

