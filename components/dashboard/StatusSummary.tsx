import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { getColors, radii, spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Skeleton } from '@/components/ui/Skeleton';
import type { DailyRecord } from '@/types';

interface StatusSummaryProps {
  latestRecord: DailyRecord | null;
  lastCleaningDate: string | null;
  isLoading: boolean;
}

function StatCard({
  label,
  value,
  unit,
  icon,
  isLoading,
}: {
  label: string;
  value: string;
  unit?: string | undefined;
  icon: string;
  isLoading: boolean;
}) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.surfaceSecondary, borderRadius: radii.md },
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text variant="caption" color={colors.textSecondary}>
        {label}
      </Text>
      {isLoading ? (
        <Skeleton height={24} width={80} borderRadius={4} style={{ marginTop: 4 }} />
      ) : (
        <View style={styles.valueRow}>
          <Text variant="h4" weight="bold" color={colors.primary}>
            {value}
          </Text>
          {unit !== undefined && (
            <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 2 }}>
              {unit}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

export function StatusSummary({ latestRecord, lastCleaningDate, isLoading }: StatusSummaryProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  const weightValue =
    latestRecord?.weight != null ? String(latestRecord.weight) : '---';

  const cleaningValue = lastCleaningDate
    ? format(parseISO(lastCleaningDate), 'M/d（EEE）', { locale: ja })
    : '---';

  return (
    <Card>
      <Text variant="h4" weight="semibold" style={{ marginBottom: spacing.md }}>
        最新ステータス
      </Text>
      <View style={styles.statsRow}>
        <StatCard
          label="最新体重"
          value={weightValue}
          unit={latestRecord?.weight != null ? 'g' : undefined}
          icon="⚖️"
          isLoading={isLoading}
        />
        <StatCard
          label="最後の掃除"
          value={cleaningValue}
          icon="🧹"
          isLoading={isLoading}
        />
      </View>
      {latestRecord && (
        <Text
          variant="caption"
          color={colors.textTertiary}
          style={{ marginTop: spacing.sm }}
        >
          最終記録: {format(parseISO(latestRecord.date), 'yyyy年M月d日', { locale: ja })}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    gap: 4,
  },
  icon: {
    fontSize: 24,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
});
