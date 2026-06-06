import React from 'react';
import { StyleSheet, TextInput, View, useColorScheme } from 'react-native';
import { getColors, fontSizes, radii, spacing } from '@/constants/theme';
import { Text } from '@/components/ui/Text';

interface WeightInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: string | undefined;
}

export function WeightInput({ value, onChange, error }: WeightInputProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const isDark = scheme === 'dark';

  return (
    <View>
      <View style={styles.row}>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder="0.0"
          placeholderTextColor={colors.textTertiary}
          maxLength={5}
          style={[
            styles.input,
            {
              backgroundColor: colors.surfaceSecondary,
              color: colors.text,
              borderColor: error ? colors.error : colors.border,
              fontSize: fontSizes['2xl'],
              borderRadius: radii.md,
            },
            isDark && styles.inputDark,
          ]}
          accessibilityLabel="体重"
        />
        <View style={[styles.unitBadge, { backgroundColor: colors.surfaceSecondary, borderRadius: radii.md }]}>
          <Text variant="h4" weight="semibold" color={colors.textSecondary}>
            g
          </Text>
        </View>
      </View>
      {error !== undefined && (
        <Text variant="caption" color={colors.error} style={{ marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    fontWeight: '700',
  },
  inputDark: {
    borderWidth: 1,
  },
  unitBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
