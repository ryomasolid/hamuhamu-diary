import React from 'react';
import { Pressable, StyleSheet, View, useColorScheme, Alert } from 'react-native';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { getColors, spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Text } from '@/components/ui/Text';
import type { DailyRecord } from '@/types';
import type { CleaningOption } from '@/types';

interface RecordCardProps {
  record: DailyRecord;
  cleaningOptions: CleaningOption[];
  onDelete: (id: string) => void;
}

export function RecordCard({ record, cleaningOptions, onDelete }: RecordCardProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  const formattedDate = format(parseISO(record.date), 'M月d日（EEE）', { locale: ja });

  const cleaningLabels = record.cleaningTaskIds
    .map((id) => cleaningOptions.find((c) => c.id === id))
    .filter((c): c is CleaningOption => c !== undefined);

  const handleLongPress = () => {
    Alert.alert('記録を削除', 'この記録を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => onDelete(record.id),
      },
    ]);
  };

  return (
    <Pressable onLongPress={handleLongPress} delayLongPress={500}>
      <Card style={styles.card}>
        {/* ヘッダー: 日付 + 体重 */}
        <View style={styles.header}>
          <Text variant="label" weight="semibold" color={colors.textSecondary}>
            {formattedDate}
          </Text>
          {record.weight != null && (
            <View style={styles.weightBadge}>
              <Text variant="h4" weight="bold" color={colors.primary}>
                {record.weight}
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 2 }}>
                g
              </Text>
            </View>
          )}
        </View>

        {/* ごはん */}
        {record.food.length > 0 && (
          <View style={[styles.section, { borderTopColor: colors.border }]}>
            <Text variant="caption" color={colors.textSecondary} style={styles.sectionLabel}>
              🌾 ごはん
            </Text>
            <Text variant="bodySmall">{record.food}</Text>
          </View>
        )}

        {/* 掃除タグ */}
        {cleaningLabels.length > 0 && (
          <View style={[styles.section, { borderTopColor: colors.border }]}>
            <Text variant="caption" color={colors.textSecondary} style={styles.sectionLabel}>
              🧹 お掃除
            </Text>
            <View style={styles.tags}>
              {cleaningLabels.map((c) => (
                <Badge key={c.id} label={`${c.emoji} ${c.name}`} color="primary" variant="subtle" />
              ))}
            </View>
          </View>
        )}

        {/* メモ */}
        {record.memo.length > 0 && (
          <View style={[styles.section, { borderTopColor: colors.border }]}>
            <Text variant="caption" color={colors.textSecondary} style={styles.sectionLabel}>
              📝 メモ
            </Text>
            <Text variant="bodySmall" color={colors.textSecondary}>
              {record.memo}
            </Text>
          </View>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  section: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  sectionLabel: {
    marginBottom: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
