import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Gradients, Spacing, Shadows } from '../../constants/theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'warm' | 'success';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function GradientButton({
  title,
  onPress,
  icon,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
}: GradientButtonProps) {
  const gradientColors = {
    primary: Gradients.primary,
    secondary: Gradients.secondary,
    warm: Gradients.warm,
    success: Gradients.success,
  }[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.container, disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={20} color="white" style={styles.icon} />}
            <Text style={[styles.text, textStyle]}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.l,
    gap: 8,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  icon: {
    marginRight: -4,
  },
  disabled: {
    opacity: 0.6,
  },
});
