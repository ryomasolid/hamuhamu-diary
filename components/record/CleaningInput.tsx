import React from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { getColors, radii, spacing } from '@/constants/theme';
import { Text } from '@/components/ui/Text';
import type { CleaningOption } from '@/types';

interface CleaningInputProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  options: CleaningOption[];
  error?: string | undefined;
}

export function CleaningInput({ selectedIds, onChange, options, error }: CleaningInputProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  const toggle = (id: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <View>
      <View style={styles.grid}>
        {options.map((option) => {
          const selected = selectedIds.includes(option.id);
          return (
            <Pressable
              key={option.id}
              onPress={() => toggle(option.id)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: selected ? colors.primary : colors.surfaceSecondary,
                  borderColor: selected ? colors.primary : colors.border,
                  borderRadius: radii.md,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
            >
              <Text variant="label" color={selected ? colors.textInverse : colors.text}>
                {option.emoji} {option.name}
              </Text>
            </Pressable>
          );
        })}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
});
