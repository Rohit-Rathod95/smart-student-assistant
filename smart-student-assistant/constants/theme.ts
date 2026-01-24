
import { Platform, ViewStyle, TextStyle } from 'react-native';

const Palette = {
  primary: '#6366f1', // Indigo 500
  primaryDark: '#4f46e5', // Indigo 600
  primaryLight: '#818cf8', // Indigo 400

  secondary: '#14b8a6', // Teal 500
  secondaryDark: '#0d9488', // Teal 600

  background: '#f8fafc', // Slate 50
  surface: '#ffffff',

  text: '#1e293b', // Slate 800
  textSecondary: '#64748b', // Slate 500
  textLight: '#94a3b8', // Slate 400

  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',

  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
};

export const Colors = {
  light: {
    text: Palette.text,
    textSecondary: Palette.textSecondary,
    textLight: Palette.textLight,
    background: Palette.background,
    surface: Palette.surface,
    tint: Palette.primary,
    icon: Palette.textSecondary,
    tabIconDefault: Palette.textLight,
    tabIconSelected: Palette.primary,
    border: Palette.gray200,
    primary: Palette.primary,
    primaryDark: Palette.primaryDark,
    secondary: Palette.secondary,
    secondaryDark: Palette.secondaryDark,
    danger: Palette.danger,
    warning: Palette.warning,
    success: Palette.success,
    gray100: Palette.gray100,
    gray200: Palette.gray200,
  },
  dark: {
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textLight: '#94a3b8',
    background: '#0f172a',
    surface: '#1e293b',
    tint: Palette.primaryLight,
    icon: '#94a3b8',
    tabIconDefault: '#64748b',
    tabIconSelected: Palette.primaryLight,
    border: '#334155',
    primary: Palette.primaryLight,
    primaryDark: Palette.primary,
    secondary: Palette.secondary,
    secondaryDark: Palette.secondaryDark,
    danger: '#f87171',
    warning: '#fbbf24',
    success: '#34d399',
    gray100: '#1e293b',
    gray200: '#334155',
  },
};

export const Spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

export const Shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  } as ViewStyle,
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3, // Android
  } as ViewStyle,
  large: {
    shadowColor: "#6366f1", // Tinted shadow
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 8,
  } as ViewStyle,
};

export const Typography = {
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: Palette.text,
  } as TextStyle,
  subheader: {
    fontSize: 18,
    fontWeight: '600',
    color: Palette.text,
  } as TextStyle,
  body: {
    fontSize: 16,
    color: Palette.textSecondary,
    lineHeight: 24,
  } as TextStyle,
  caption: {
    fontSize: 12,
    color: Palette.textLight,
  } as TextStyle,
};

export const Layout = {
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    padding: Spacing.m,
  } as ViewStyle,
};
