import { Platform, ViewStyle, TextStyle } from 'react-native';

const Palette = {
  // Vibrant & Friendly Primary (Blue-Purple Gradient base)
  primary: '#4F46E5',     // Indigo 600
  primaryLight: '#818CF8', // Indigo 400
  primaryDark: '#4338CA',  // Indigo 700

  // Fresh & Motivating Secondary (Teal/Emerald)
  secondary: '#10B981',    // Emerald 500
  secondaryLight: '#34D399', // Emerald 400
  secondaryDark: '#059669', // Emerald 600

  // Accent (Warm/Playful - Orange/Yellow)
  accent: '#F59E0B',      // Amber 500
  accentLight: '#FBBF24', // Amber 400

  // Backgrounds - Move away from stark white
  background: '#F0F5FF',   // Very light cool blue tint
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',   // Slate 50 (for secondary cards)

  // Text
  text: '#1E293B',        // Slate 800 (High contrast)
  textSecondary: '#64748B', // Slate 500 (Medium contrast)
  textLight: '#94A3B8',   // Slate 400 (Low contrast/icons)

  // System
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Grays for borders/dividers
  border: '#E2E8F0',      // Slate 200
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
};

export const Colors = {
  light: {
    text: Palette.text,
    textSecondary: Palette.textSecondary,
    textLight: Palette.textLight,
    background: Palette.background,
    surface: Palette.surface,
    surfaceAlt: Palette.surfaceAlt,

    primary: Palette.primary,
    primaryLight: Palette.primaryLight,
    primaryDark: Palette.primaryDark,

    secondary: Palette.secondary,
    secondaryLight: Palette.secondaryLight,
    secondaryDark: Palette.secondaryDark,

    accent: Palette.accent,

    border: Palette.border,
    icon: Palette.textSecondary,

    tabIconDefault: Palette.textLight,
    tabIconSelected: Palette.primary,

    success: Palette.success,
    danger: Palette.danger,
    warning: Palette.warning,
    info: Palette.info,

    // Specific UI colors
    cardBackground: Palette.surface,
    screenBackground: Palette.background,

    gray100: Palette.gray100,
    gray200: Palette.gray200,
  },
  dark: {
    // Keeping a placeholder darker mode, but focusing on Light mode polish as requested
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textLight: '#64748B',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceAlt: '#334155',
    primary: Palette.primaryLight,
    secondary: Palette.secondary,
    accent: Palette.accent,
    border: '#334155',
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: Palette.primaryLight,
    success: '#34D399',
    danger: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
    cardBackground: '#1E293B',
    screenBackground: '#0F172A',
    gray100: '#1e293b',
    gray200: '#334155',
  },
};

export const Gradients = {
  primary: [Palette.primary, '#6366F1'] as const, // Indigo 600 -> Indigo 500
  primaryPurple: [Palette.primary, '#8B5CF6'] as const, // Indigo -> Purple
  secondary: [Palette.secondary, '#34D399'] as const, // Emerald 500 -> 400
  warm: [Palette.accent, '#FCD34D'] as const, // Amber 500 -> 300
  card: ['#FFFFFF', '#F8FAFC'] as const,
  background: ['#F0F5FF', '#E0E7FF', '#F5F3FF'] as const, // Soft blue-purple gradient
  backgroundAlt: ['#F8FAFC', '#F1F5F9'] as const, // Neutral gradient
  success: [Palette.secondary, '#34D399'] as const,
  accent: [Palette.accent, '#FCD34D'] as const,
};

export const Spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const Shadows = {
  small: {
    shadowColor: "#64748B", // Slate 500 shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: "#6366F1", // Indigo tinted shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  large: {
    shadowColor: "#4338CA", // Deep Indigo shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  float: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  }
};

export const Typography = {
  header: {
    fontSize: 28,
    fontWeight: '800', // Extra bold
    color: Palette.text,
    letterSpacing: -0.5,
  } as TextStyle,
  subheader: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.text,
    letterSpacing: -0.5,
  } as TextStyle,
  body: {
    fontSize: 16,
    color: Palette.textSecondary,
    lineHeight: 24,
    fontWeight: '400',
  } as TextStyle,
  caption: {
    fontSize: 13,
    color: Palette.textLight,
    fontWeight: '500',
  } as TextStyle,
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } as TextStyle
};

export const Layout = {
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 24, // More rounded
    padding: Spacing.m,
  } as ViewStyle,
  screenContainer: {
    flex: 1,
    backgroundColor: Palette.background,
    padding: Spacing.m,
  } as ViewStyle
};
