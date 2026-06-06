import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { getColors, radii, spacing } from '@/constants/theme';
import { BaseComponentProps } from '@/types';

interface CardProps extends BaseComponentProps {
  children: React.ReactNode;
  padding?: keyof typeof spacing;
  elevated?: boolean;
  bordered?: boolean;
}

export function Card({
  children,
  padding = 'md',
  elevated = true,
  bordered = false,
  style,
  testID,
}: CardProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const isDark = scheme === 'dark';

  return (
    <View
      testID={testID}
      style={[
        styles.base,
        {
          padding: spacing[padding],
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          borderWidth: bordered ? 1 : 0,
          borderColor: colors.border,
        },
        elevated && (isDark ? styles.elevatedDark : styles.elevatedLight),
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
  },
  elevatedLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  elevatedDark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
