import { Platform } from 'react-native';

export const palette = {
  primary: '#35B4A3',
  secondary: '#607F70',
  earth: '#6C4E3E',
  background: '#F8FBFA',
  black: '#000000',
} as const;

export const opacity = {
  black04: 'rgba(0, 0, 0, 0.04)',
  black06: 'rgba(0, 0, 0, 0.06)',
  black08: 'rgba(0, 0, 0, 0.08)',
  black12: 'rgba(0, 0, 0, 0.12)',
  black16: 'rgba(0, 0, 0, 0.16)',
  black24: 'rgba(0, 0, 0, 0.24)',
  black40: 'rgba(0, 0, 0, 0.40)',
  black56: 'rgba(0, 0, 0, 0.56)',
  black68: 'rgba(0, 0, 0, 0.68)',
  primary10: 'rgba(53, 180, 163, 0.10)',
  primary16: 'rgba(53, 180, 163, 0.16)',
  primary24: 'rgba(53, 180, 163, 0.24)',
  primary36: 'rgba(53, 180, 163, 0.36)',
  secondary10: 'rgba(96, 127, 112, 0.10)',
  secondary16: 'rgba(96, 127, 112, 0.16)',
  secondary24: 'rgba(96, 127, 112, 0.24)',
  earth10: 'rgba(108, 78, 62, 0.10)',
  earth16: 'rgba(108, 78, 62, 0.16)',
  earth24: 'rgba(108, 78, 62, 0.24)',
  surface88: 'rgba(248, 251, 250, 0.88)',
  surface96: 'rgba(248, 251, 250, 0.96)',
} as const;

export const colors = {
  primary: palette.primary,
  secondary: palette.secondary,
  earth: palette.earth,
  background: palette.background,
  surface: palette.background,
  text: palette.black,
  strongText: palette.black,
  icon: palette.black,
  border: opacity.black12,
  muted: opacity.black06,
  textMuted: opacity.black56,
  textSoft: opacity.black40,
  primarySoft: opacity.primary10,
  secondarySoft: opacity.secondary10,
  earthSoft: opacity.earth10,
  primaryLight: palette.primary,
  primaryDark: palette.primary,
  danger: palette.earth,
  dangerSoft: opacity.earth10,
  warning: palette.earth,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  round: 999,
} as const;

export const typography = {
  fontFamily: 'FuturaBook',
  fontFamilyBold: 'FuturaBold',
  weights: {
    regular: '400',
    medium: '600',
    bold: '700',
    black: '900',
  },
} as const;

export const shadows = {
  soft: Platform.select({
    ios: {
      shadowColor: palette.black,
      shadowOpacity: 0.08,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
    },
    android: {
      elevation: 3,
    },
    default: {},
  }),
  card: Platform.select({
    ios: {
      shadowColor: palette.black,
      shadowOpacity: 0.12,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
    },
    android: {
      elevation: 5,
    },
    default: {},
  }),
} as const;
