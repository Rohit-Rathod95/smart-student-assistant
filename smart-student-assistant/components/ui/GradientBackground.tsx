import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients } from '../../constants/theme';

interface GradientBackgroundProps {
  children: React.ReactNode;
  variant?: 'default' | 'alt';
  style?: ViewStyle;
}

export function GradientBackground({ children, variant = 'default', style }: GradientBackgroundProps) {
  const colors = variant === 'default' ? Gradients.background : Gradients.backgroundAlt;

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
