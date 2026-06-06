import React from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { getColors, radii, spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Skeleton } from '@/components/ui/Skeleton';
import type { DailyTask } from '@/types';

interface TaskChecklistProps {
  tasks: DailyTask[];
  completedCount: number;
  totalCount: number;
  isLoading: boolean;
  onToggle: (id: string) => void;
}

function TaskItem({
  task,
  onToggle,
}: {
  task: DailyTask;
  onToggle: (id: string) => void;
}) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(task.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: task.completed }}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: task.completed ? colors.primary : colors.border,
            backgroundColor: task.completed ? colors.primary : 'transparent',
          },
        ]}
      >
        {task.completed && (
          <Text variant="caption" weight="bold" color={colors.textInverse}>
            ✓
          </Text>
        )}
      </View>
      <Text variant="label" style={{ marginLeft: spacing.sm }}>
        {task.emoji} {task.label}
      </Text>
      {task.completed && (
        <View
          style={[styles.strikeThrough, { backgroundColor: colors.textTertiary }]}
        />
      )}
    </Pressable>
  );
}

export function TaskChecklist({
  tasks,
  completedCount,
  totalCount,
  isLoading,
  onToggle,
}: TaskChecklistProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  return (
    <Card>
      <View style={styles.header}>
        <Text variant="h4" weight="semibold">
          今日のお世話
        </Text>
        <View
          style={[styles.counter, { backgroundColor: colors.surfaceSecondary }]}
        >
          <Text variant="label" weight="bold" color={colors.primary}>
            {completedCount}/{totalCount}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
          <Skeleton height={40} borderRadius={radii.md} />
          <Skeleton height={40} borderRadius={radii.md} />
          <Skeleton height={40} borderRadius={radii.md} />
        </View>
      ) : (
        <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={onToggle} />
          ))}
        </View>
      )}

      {!isLoading && completedCount === totalCount && (
        <View style={[styles.allDone, { backgroundColor: `${colors.success}15` }]}>
          <Text variant="bodySmall" weight="semibold" color={colors.success} align="center">
            🎉 今日のお世話が全部終わりました！
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counter: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    position: 'relative',
  },
  itemPressed: {
    opacity: 0.7,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radii.xs,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strikeThrough: {
    position: 'absolute',
    left: 40,
    right: spacing.sm,
    height: 1,
    top: '50%',
    opacity: 0.4,
  },
  allDone: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: radii.md,
  },
});
