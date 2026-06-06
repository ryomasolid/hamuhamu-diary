import React from 'react';
import { Text as RNText, StyleSheet, useColorScheme } from 'react-native';
import { getColors, fontSizes, fontWeights } from '@/constants/theme';
import { TextComponentProps, TextVariant, FontWeight } from '@/types';

interface TextProps extends TextComponentProps {
  variant?: TextVariant;
  weight?: FontWeight;
  color?: string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  children: React.ReactNode;
}

const variantStyles: Record<TextVariant, { fontSize: number; fontWeight: string; lineHeight: number }> = {
  h1: { fontSize: fontSizes['4xl'], fontWeight: fontWeights.bold, lineHeight: 44 },
  h2: { fontSize: fontSizes['3xl'], fontWeight: fontWeights.bold, lineHeight: 38 },
  h3: { fontSize: fontSizes['2xl'], fontWeight: fontWeights.semibold, lineHeight: 32 },
  h4: { fontSize: fontSizes.xl, fontWeight: fontWeights.semibold, lineHeight: 28 },
  body: { fontSize: fontSizes.md, fontWeight: fontWeights.normal, lineHeight: 24 },
  bodySmall: { fontSize: fontSizes.sm, fontWeight: fontWeights.normal, lineHeight: 20 },
  caption: { fontSize: fontSizes.xs, fontWeight: fontWeights.normal, lineHeight: 16 },
  label: { fontSize: fontSizes.sm, fontWeight: fontWeights.medium, lineHeight: 20 },
};

export function Text({
  variant = 'body',
  weight,
  color,
  align = 'left',
  numberOfLines,
  style,
  testID,
  children,
}: TextProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const vStyle = variantStyles[variant];

  return (
    <RNText
      testID={testID}
      numberOfLines={numberOfLines}
      style={[
        styles.base,
        {
          fontSize: vStyle.fontSize,
          fontWeight: (weight ? fontWeights[weight] : vStyle.fontWeight) as '400' | '500' | '600' | '700',
          lineHeight: vStyle.lineHeight,
          color: color ?? colors.text,
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
