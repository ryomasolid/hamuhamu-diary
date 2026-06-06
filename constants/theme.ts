import { ColorSchemeName, Platform } from 'react-native';

export const palette = {
  primary: {
    50: '#FFF3EC',
    100: '#FFE2CC',
    200: '#FFB381',
    300: '#FF8C50',
    400: '#E8804A',
    500: '#D4703A',
    600: '#B85E2A',
    700: '#8C441A',
    800: '#5E2C0A',
    900: '#301500',
  },
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
  },
  gray: {
    50: '#FAFAF9',
    100: '#F5F0EB',
    200: '#E8DDD3',
    300: '#D4C4B4',
    400: '#B0998A',
    500: '#8C7B6E',
    600: '#6B5B50',
    700: '#4A3D35',
    800: '#2D2420',
    900: '#1A1410',
  },
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  border: string;
  borderStrong: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

const lightColors: ThemeColors = {
  primary: palette.primary[400],
  primaryLight: palette.primary[200],
  primaryDark: palette.primary[600],
  accent: palette.amber[400],
  background: '#FFF8F0',
  backgroundSecondary: palette.gray[100],
  surface: palette.white,
  surfaceSecondary: '#FFF0E5',
  text: palette.gray[800],
  textSecondary: palette.gray[500],
  textTertiary: palette.gray[400],
  textInverse: palette.white,
  border: palette.gray[200],
  borderStrong: palette.gray[300],
  success: palette.success,
  warning: palette.warning,
  error: palette.error,
  info: palette.info,
};

const darkColors: ThemeColors = {
  primary: palette.primary[300],
  primaryLight: palette.primary[200],
  primaryDark: palette.primary[400],
  accent: palette.amber[400],
  background: '#1C1A18',
  backgroundSecondary: palette.gray[800],
  surface: '#2C2724',
  surfaceSecondary: '#3A3330',
  text: '#F5EDE5',
  textSecondary: palette.gray[400],
  textTertiary: palette.gray[500],
  textInverse: palette.gray[900],
  border: '#3A3330',
  borderStrong: palette.gray[600],
  success: palette.success,
  warning: palette.warning,
  error: palette.error,
  info: palette.info,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const fontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: { elevation: 4 },
    default: {},
  }),
} as const;

export const AD_BANNER_HEIGHT = 60;

export function getColors(scheme: ColorSchemeName): ThemeColors {
  return scheme === 'dark' ? darkColors : lightColors;
}

export const theme = {
  palette,
  spacing,
  radii,
  fontSizes,
  fontWeights,
  light: lightColors,
  dark: darkColors,
} as const;
