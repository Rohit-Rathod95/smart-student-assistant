import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Colors, Shadows, Spacing } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof Spacing;
}

export function Card({ children, style, variant = 'default', padding = 'm' }: CardProps) {
  const cardStyle = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    { padding: Spacing[padding] },
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    ...Shadows.small,
  },
  elevated: {
    ...Shadows.medium,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.small,
  },
});
