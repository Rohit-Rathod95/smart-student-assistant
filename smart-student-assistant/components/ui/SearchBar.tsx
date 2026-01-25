import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Shadows } from '../../constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search...', style }: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search" size={18} color={Colors.light.textLight} style={styles.icon} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={Colors.light.textLight}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} activeOpacity={0.7}>
          <Ionicons
            name="close-circle"
            size={18}
            color={Colors.light.textLight}
            style={styles.clearIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    ...Shadows.small,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  icon: {
    marginRight: Spacing.s,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    height: 40,
  },
  clearIcon: {
    marginLeft: Spacing.s,
  },
});
