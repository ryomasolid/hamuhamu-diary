import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getColors, radii, spacing } from '@/constants/theme';
import { AdBanner } from '@/components/ui/AdBanner';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { StatusSummary } from '@/components/dashboard/StatusSummary';
import { useLatestRecord, useRecords } from '@/hooks/useRecords';
import { useProfile } from '@/hooks/useProfile';
import { useRecordStore } from '@/store/recordStore';
import type { DailyRecord } from '@/types';

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

function PhotoMemory({ record }: { record: DailyRecord }) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  const dateLabel = format(parseISO(record.date), 'yyyy年M月d日（EEE）', { locale: ja });

  return (
    <View>
      <Text variant="label" weight="semibold" style={{ marginBottom: spacing.sm }}>
        📸 思い出フォト
      </Text>
      <Pressable
        onPress={() =>
          router.push({ pathname: '/record', params: { id: record.id } })
        }
        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
      >
        <View style={[styles.photoCard, { borderRadius: radii.lg, backgroundColor: colors.surfaceSecondary }]}>
          <Image
            source={{ uri: record.photoUri! }}
            style={[styles.photoImage, { borderRadius: radii.lg }]}
            resizeMode="cover"
          />
          <View style={[styles.photoOverlay, { borderRadius: radii.lg }]}>
            <Text variant="caption" color="#FFFFFF" weight="medium">
              {dateLabel}
            </Text>
            {record.memo.length > 0 && (
              <Text variant="caption" color="rgba(255,255,255,0.85)" numberOfLines={1}>
                {record.memo}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
}

export default function DashboardScreen() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const insets = useSafeAreaInsets();
  const { record: latestRecord, isLoading: recordLoading } = useLatestRecord();
  const { records } = useRecords();
  const { profile } = useProfile();
  const getLastCleaningDate = useRecordStore((s) => s.getLastCleaningDate);

  const today = format(new Date(), 'yyyy年M月d日（EEE）', { locale: ja });
  const greeting = profile?.name ? `${profile.name}の今日のお世話` : '今日のお世話';

  const randomPhotoRecord = useMemo(() => {
    const withPhotos = records.filter((r) => r.photoUri != null);
    if (withPhotos.length === 0) return null;
    return withPhotos[Math.floor(Math.random() * withPhotos.length)] ?? null;
  }, [records]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダーセクション */}
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text variant="caption" color={colors.textSecondary}>
              {today}
            </Text>
            <Text variant="h3" weight="bold" style={{ marginTop: spacing.xs }}>
              {greeting}
            </Text>
          </View>
          {profile != null && (
            <View
              style={[
                styles.heroAvatar,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
              ]}
            >
              {profile.photoUri != null ? (
                <Image source={{ uri: profile.photoUri }} style={styles.heroAvatarImage} />
              ) : (
                <Text style={styles.heroAvatarEmoji}>🐹</Text>
              )}
            </View>
          )}
        </View>

        {/* クイック記録ボタン */}
        <RecordButton />

        {/* 思い出フォト */}
        {randomPhotoRecord != null && (
          <PhotoMemory record={randomPhotoRecord} />
        )}

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

        <AdBanner />
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroText: {
    flex: 1,
  },
  heroAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginLeft: spacing.md,
  },
  heroAvatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  heroAvatarEmoji: {
    fontSize: 28,
  },
  recordBtn: {
    padding: spacing.md,
    alignItems: 'center',
  },
  photoCard: {
    width: '100%',
    aspectRatio: 4 / 3,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  setupCard: {
    gap: spacing.sm,
  },
  setupBtn: {
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
});
