import React, { useRef, useState } from 'react';
import { Alert, Image, Pressable, Share, StyleSheet, View, useColorScheme } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import * as Haptics from 'expo-haptics';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { getColors, palette, spacing } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { calculateAge } from '@/lib/age';
import { resolvePhotoUri } from '@/lib/photos';
import { useProfileStore } from '@/store/profileStore';
import { useRecordStore } from '@/store/recordStore';

const APP_ICON = require('@/assets/images/icon.png');
const SHARE_HASHTAGS = '#はむはむ日記 #ハムスター #ハムスターのいる生活';

/**
 * SNS シェア用の記録カード。
 * 画面に表示しているカードをそのまま画像化して共有シートに渡す。
 * カードはテーマに関わらず常にライト配色（投稿先で見栄えを揃えるため）。
 */
export default function ShareCardScreen() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const record = useRecordStore((s) => s.records.find((r) => r.id === id) ?? null);
  const profile = useProfileStore((s) => s.profile);
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);

  if (!record) {
    return (
      <SafeAreaView style={[styles.screen, styles.center, { backgroundColor: colors.background }]}>
        <Text variant="body" color={colors.textSecondary}>記録が見つかりませんでした</Text>
        <Button label="閉じる" variant="ghost" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const photo = resolvePhotoUri(record.photoUri);
  const dateLabel = format(parseISO(record.date), 'yyyy.M.d（EEE）', { locale: ja });
  const age = profile?.birthDate ? calculateAge(profile.birthDate, parseISO(record.date)) : null;

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, width: 1080 });
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({ url: uri, message: SHARE_HASHTAGS });
    } catch {
      Alert.alert('エラー', '画像の作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text variant="label" color={colors.textSecondary}>閉じる</Text>
        </Pressable>
        <Text variant="h4" weight="bold">シェアカード</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.previewArea}>
        {/* ↓ この View がそのまま画像になる */}
        <View ref={cardRef} collapsable={false} style={styles.card}>
          <View style={styles.photoFrame}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
            ) : (
              <View style={[styles.photo, styles.photoPlaceholder]}>
                <Text style={styles.placeholderEmoji}>🐹</Text>
              </View>
            )}
            <View style={styles.dateChip}>
              <Text variant="caption" weight="bold" color={palette.gray[800]}>{dateLabel}</Text>
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.nameRow}>
              <Text variant="h3" weight="bold" color={palette.gray[800]} numberOfLines={1} style={{ flexShrink: 1 }}>
                {profile?.name ?? 'うちのハムちゃん'}
              </Text>
              {age != null && (
                <View style={styles.ageChip}>
                  <Text variant="caption" weight="bold" color={palette.primary[600]}>{age}</Text>
                </View>
              )}
              {record.weight != null && (
                <View style={styles.weight}>
                  <Text style={styles.weightValue}>{record.weight}</Text>
                  <Text variant="label" weight="bold" color={palette.gray[500]}>g</Text>
                </View>
              )}
            </View>
            {record.memo.length > 0 && (
              <Text variant="bodySmall" color={palette.gray[600]} numberOfLines={3} style={{ marginTop: spacing.xs }}>
                {record.memo}
              </Text>
            )}
          </View>

          <View style={styles.footer}>
            <Image source={APP_ICON} style={styles.appIcon} />
            <Text variant="caption" weight="bold" color={palette.gray[600]}>はむはむ日記</Text>
            <Text variant="caption" color={palette.gray[400]} style={{ marginLeft: 'auto' }}>
              #ハムスターのいる生活
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          label={isSharing ? '画像を作成中…' : '📤 画像をシェアする'}
          onPress={() => void handleShare()}
          disabled={isSharing}
          fullWidth
          size="lg"
        />
        <Text variant="caption" color={colors.textTertiary} align="center">
          Instagram・X・LINE などに投稿できます
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  previewArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: '#FFF8F0',
    borderRadius: 20,
    padding: 14,
    overflow: 'hidden',
  },
  photoFrame: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: palette.primary[50],
  },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 96, lineHeight: 116 },
  dateChip: {
    position: 'absolute',
    left: 10,
    top: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  body: { paddingTop: 12, paddingHorizontal: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ageChip: {
    backgroundColor: palette.primary[100],
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  weight: { flexDirection: 'row', alignItems: 'baseline', marginLeft: 'auto', gap: 2 },
  weightValue: { fontSize: 28, lineHeight: 34, fontWeight: '800', color: palette.primary[400] },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  appIcon: { width: 20, height: 20, borderRadius: 5 },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
});
