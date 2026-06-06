import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { getColors, radii, fontSizes, spacing } from '@/constants/theme';
import { Text } from './Text';

type BadgeVariant = 'solid' | 'subtle' | 'outline';
type BadgeColor = 'primary' | 'success' | 'warning' | 'error' | 'gray';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: 'sm' | 'md';
}

export function Badge({ label, variant = 'subtle', color = 'primary', size = 'sm' }: BadgeProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  const resolveAccent = (): string => {
    if (color === 'success') return colors.success;
    if (color === 'warning') return colors.warning;
    if (color === 'error') return colors.error;
    if (color === 'gray') return colors.textSecondary;
    return colors.primary;
  };

  const accent = resolveAccent();
  const isDark = scheme === 'dark';

  const bg =
    variant === 'solid'
      ? accent
      : variant === 'subtle'
        ? isDark
          ? `${accent}30`
          : `${accent}18`
        : 'transparent';

  const textColor = variant === 'solid' ? colors.textInverse : accent;

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: bg,
          borderRadius: radii.full,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: accent,
          paddingHorizontal: size === 'sm' ? spacing.sm : spacing.md,
          paddingVertical: size === 'sm' ? 2 : spacing.xs,
        },
      ]}
    >
      <Text
        variant="caption"
        weight="semibold"
        color={textColor}
        style={{ fontSize: size === 'sm' ? fontSizes.xs : fontSizes.sm }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
  },
});
