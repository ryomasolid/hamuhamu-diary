import React from 'react';
import { Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import * as Haptics from 'expo-haptics';
import { getColors, spacing, AD_BANNER_HEIGHT } from '@/constants/theme';
import { AdBanner } from '@/components/ui/AdBanner';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { TaskChecklist } from '@/components/dashboard/TaskChecklist';
import { StatusSummary } from '@/components/dashboard/StatusSummary';
import { useTasks } from '@/hooks/useTasks';
import { useLatestRecord } from '@/hooks/useRecords';
import { useProfile } from '@/hooks/useProfile';
import { useRecordStore } from '@/store/recordStore';

function RecordButton() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/record');
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.recordBtn,
        {
          backgroundColor: colors.primary,
          borderRadius: 16,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel="記録を追加"
    >
      <Text variant="h4" weight="bold" color={colors.textInverse}>
        ＋ 記録する
      </Text>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const { tasks, completedCount, totalCount, isLoading: tasksLoading, toggleTask } = useTasks();
  const { record: latestRecord, isLoading: recordLoading } = useLatestRecord();
  const { profile } = useProfile();
  const getLastCleaningDate = useRecordStore((s) => s.getLastCleaningDate);

  const today = format(new Date(), 'yyyy年M月d日（EEE）', { locale: ja });
  const greeting = profile?.name ? `${profile.name}の今日のお世話` : '今日のお世話';

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: AD_BANNER_HEIGHT + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダーセクション */}
        <View style={styles.hero}>
          <Text variant="caption" color={colors.textSecondary}>
            {today}
          </Text>
          <Text variant="h3" weight="bold" style={{ marginTop: spacing.xs }}>
            {greeting} 🐹
          </Text>
        </View>

        {/* クイック記録ボタン */}
        <RecordButton />

        {/* タスクチェックリスト */}
        <TaskChecklist
          tasks={tasks}
          completedCount={completedCount}
          totalCount={totalCount}
          isLoading={tasksLoading}
          onToggle={toggleTask}
        />

        {/* ステータスサマリー */}
        <StatusSummary
          latestRecord={latestRecord}
          lastCleaningDate={getLastCleaningDate()}
          isLoading={recordLoading}
        />

        {/* プロフィール未登録の場合 */}
        {!profile && (
          <Card style={styles.setupCard} bordered elevated={false}>
            <Text variant="label" weight="semibold" align="center">
              🐾 まずはプロフィールを登録しよう
            </Text>
            <Text variant="bodySmall" color={colors.textSecondary} align="center" style={{ marginTop: spacing.xs }}>
              プロフィールタブからハムスターの情報を登録できます
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/profile')}
              style={[styles.setupBtn, { backgroundColor: colors.primary, borderRadius: 8 }]}
            >
              <Text variant="label" weight="bold" color={colors.textInverse} align="center">
                プロフィールを登録する
              </Text>
            </Pressable>
          </Card>
        )}
      </ScrollView>

      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
  },
  hero: {
    paddingTop: spacing.sm,
  },
  recordBtn: {
    padding: spacing.md,
    alignItems: 'center',
  },
  setupCard: {
    gap: spacing.sm,
  },
  setupBtn: {
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
});
