import React, { useCallback } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getColors, spacing, radii } from '@/constants/theme';
import { AdBanner } from '@/components/ui/AdBanner';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { RecordCard } from '@/components/diary/RecordCard';
import { useRecords, useDeleteRecord } from '@/hooks/useRecords';
import { useCleaningOptions } from '@/hooks/useProfile';
import type { DailyRecord } from '@/types';

function EmptyState() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  return (
    <View style={styles.empty}>
      <Text style={{ fontSize: 56 }}>📔</Text>
      <Text variant="h4" weight="semibold" align="center" style={{ marginTop: spacing.md }}>
        まだ記録がありません
      </Text>
      <Text variant="bodySmall" color={colors.textSecondary} align="center">
        「記録する」ボタンから、体重やごはん、掃除の記録を残しましょう
      </Text>
      <Pressable
        onPress={() => router.push('/record')}
        style={[styles.emptyBtn, { backgroundColor: colors.primary, borderRadius: radii.md }]}
      >
        <Text variant="label" weight="bold" color={colors.textInverse}>
          ＋ 最初の記録を追加
        </Text>
      </Pressable>
    </View>
  );
}

function LoadingSkeleton() {
  return (
    <View style={{ padding: spacing.md, gap: spacing.md }}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={[styles.skeletonCard, { borderRadius: 16 }]}
        >
          <Skeleton height={20} width="50%" borderRadius={4} />
          <Skeleton height={14} width="80%" borderRadius={4} style={{ marginTop: spacing.sm }} />
          <Skeleton height={14} width="65%" borderRadius={4} style={{ marginTop: spacing.xs }} />
        </View>
      ))}
    </View>
  );
}

export default function DiaryScreen() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const insets = useSafeAreaInsets();
  const { records, isLoading, error } = useRecords();
  const { mutate: deleteRecord } = useDeleteRecord();
  const cleaningOptions = useCleaningOptions();

  const handleDelete = useCallback(
    (id: string) => {
      deleteRecord(id);
    },
    [deleteRecord],
  );

  const handleFabPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/record');
  };

  const renderItem = useCallback(
    ({ item }: { item: DailyRecord }) => (
      <RecordCard
        record={item}
        cleaningOptions={cleaningOptions}
        onDelete={handleDelete}
        onPress={() => router.push({ pathname: '/record', params: { id: item.id } })}
      />
    ),
    [cleaningOptions, handleDelete],
  );

  const keyExtractor = useCallback((item: DailyRecord) => item.id, []);

  if (isLoading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <LoadingSkeleton />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.background }]}>
        <Text variant="h4" color={colors.error} align="center">
          読み込みエラーが発生しました
        </Text>
        <Text variant="bodySmall" color={colors.textSecondary} align="center">
          {String(error)}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={records}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.list,
          records.length === 0 && styles.listEmpty,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        ListEmptyComponent={<EmptyState />}
        ListFooterComponent={records.length > 0 ? <AdBanner /> : null}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => undefined}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      {records.length > 0 && (
        <Pressable
          onPress={handleFabPress}
          style={({ pressed }) => [
            styles.fab,
            {
              bottom: insets.bottom + spacing.lg,
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="記録を追加"
        >
          <Text variant="h4" weight="bold" color={colors.textInverse}>
            ＋
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    padding: spacing.md,
  },
  listEmpty: {
    flexGrow: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
