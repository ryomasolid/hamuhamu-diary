import React from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { getColors, radii, spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import type { ReminderWithProgress } from '@/hooks/useReminders';

interface ReminderCardProps {
  reminder: ReminderWithProgress;
  onReset: (id: string) => void;
}

export function ReminderCard({ reminder, onReset }: ReminderCardProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  const barColor = reminder.isOverdue
    ? colors.error
    : reminder.isWarning
      ? colors.warning
      : colors.success;

  const statusLabel = reminder.isOverdue
    ? '⚠️ 交換時期です！'
    : reminder.isWarning
      ? '🔶 もうすぐ交換時期'
      : '✅ 良好';

  const statusColor = reminder.isOverdue
    ? colors.error
    : reminder.isWarning
      ? colors.warning
      : colors.success;

  const handleReset = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReset(reminder.id);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>{reminder.emoji}</Text>
          <View>
            <Text variant="label" weight="semibold">
              {reminder.name}
            </Text>
            <Text variant="caption" color={statusColor} weight="medium">
              {statusLabel}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={handleReset}
          style={[
            styles.resetBtn,
            { backgroundColor: colors.primary, borderRadius: radii.full },
          ]}
        >
          <Text variant="caption" weight="bold" color={colors.textInverse}>
            リセット
          </Text>
        </Pressable>
      </View>

      <View style={styles.progressSection}>
        <ProgressBar
          progress={reminder.progress}
          color={barColor}
          backgroundColor={colors.border}
          height={8}
        />
        <View style={styles.progressLabels}>
          <Text variant="caption" color={colors.textSecondary}>
            {reminder.daysPassed}日経過
          </Text>
          <Text variant="caption" color={colors.textTertiary}>
            目安 {reminder.cycleDays}日ごと
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  emoji: {
    fontSize: 28,
  },
  resetBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  progressSection: {
    gap: spacing.xs,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
