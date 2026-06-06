import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { getColors, radii, spacing, fontSizes } from '@/constants/theme';
import { Text } from './Text';
import { ColorScheme, Size, Variant } from '@/types';

interface ButtonProps {
  onPress?: () => void;
  label: string;
  variant?: Variant;
  colorScheme?: ColorScheme;
  size?: Size;
  disabled?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const sizeMap: Record<Size, { paddingVertical: number; paddingHorizontal: number; fontSize: number; iconSize: number }> = {
  sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, fontSize: fontSizes.sm, iconSize: 14 },
  md: { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md, fontSize: fontSizes.md, iconSize: 16 },
  lg: { paddingVertical: spacing.md - 2, paddingHorizontal: spacing.lg, fontSize: fontSizes.lg, iconSize: 18 },
};

export function Button({
  onPress,
  label,
  variant = 'solid',
  colorScheme = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
}: ButtonProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const sz = sizeMap[size];
  const isDisabled = disabled || isLoading;

  const resolveColor = (): string => {
    if (colorScheme === 'primary') return colors.primary;
    if (colorScheme === 'secondary') return colors.accent;
    if (colorScheme === 'success') return colors.success;
    if (colorScheme === 'warning') return colors.warning;
    if (colorScheme === 'error') return colors.error;
    return colors.textSecondary;
  };

  const accentColor = resolveColor();

  const containerStyle = StyleSheet.flatten([
    styles.base,
    {
      paddingVertical: sz.paddingVertical,
      paddingHorizontal: sz.paddingHorizontal,
      borderRadius: radii.md,
      alignSelf: fullWidth ? ('stretch' as const) : ('flex-start' as const),
      opacity: isDisabled ? 0.5 : 1,
    },
    variant === 'solid' && {
      backgroundColor: accentColor,
    },
    variant === 'outline' && {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: accentColor,
    },
    variant === 'ghost' && {
      backgroundColor: 'transparent',
    },
  ]);

  const labelColor =
    variant === 'solid' ? colors.textInverse : accentColor;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      style={({ pressed }) => [containerStyle, pressed && !isDisabled && styles.pressed]}
    >
      <View style={styles.inner}>
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={labelColor}
            style={styles.loader}
          />
        ) : (
          <>
            {leftIcon != null && <View style={styles.iconLeft}>{leftIcon}</View>}
            <Text
              variant="label"
              weight="semibold"
              color={labelColor}
              style={{ fontSize: sz.fontSize }}
            >
              {label}
            </Text>
            {rightIcon != null && <View style={styles.iconRight}>{rightIcon}</View>}
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    marginHorizontal: spacing.xs,
  },
  iconLeft: {
    marginRight: spacing.xs,
  },
  iconRight: {
    marginLeft: spacing.xs,
  },
  pressed: {
    opacity: 0.75,
  },
});
