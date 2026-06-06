import React from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { BaseLayout } from '@/components/BaseLayout';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { getColors, spacing } from '@/constants/theme';

interface NavRowProps {
  emoji: string;
  label: string;
  description: string;
  onPress: () => void;
}

function NavRow({ emoji, label, description, onPress }: NavRowProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.navRow,
        { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={styles.navEmoji}>{emoji}</Text>
      <View style={styles.navText}>
        <Text variant="label" weight="medium">{label}</Text>
        <Text variant="caption" color={colors.textSecondary}>{description}</Text>
      </View>
      <Text variant="h4" color={colors.textTertiary}>›</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  return (
    <BaseLayout edges={['bottom', 'left', 'right']}>
      <Text variant="h3" weight="bold">カスタマイズ設定</Text>
      <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
        記録フォームで使う項目を自由に編集できます
      </Text>

      <Card style={styles.card}>
        <NavRow
          emoji="🧹"
          label="お掃除項目"
          description="掃除メニューの追加・編集・並び替え"
          onPress={() => router.push('/settings/cleaning')}
        />
        <NavRow
          emoji="🌾"
          label="事前登録献立"
          description="1タップ入力できる献立テンプレート"
          onPress={() => router.push('/settings/meals')}
        />
        <NavRow
          emoji="🥕"
          label="単体フード"
          description="おやつ・追加フードの選択肢"
          onPress={() => router.push('/settings/foods')}
        />
      </Card>

      <Card style={styles.card} elevated={false} bordered>
        <Text variant="h4" weight="semibold" style={{ marginBottom: spacing.sm }}>
          アプリ情報
        </Text>
        <View style={styles.infoRow}>
          <Text variant="label" color={colors.textSecondary}>バージョン</Text>
          <Text variant="label" weight="medium">1.0.0</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.infoRow}>
          <Text variant="label" color={colors.textSecondary}>ビルド</Text>
          <Text variant="label" weight="medium">1</Text>
        </View>
      </Card>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.md },
  card: { marginBottom: spacing.md },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  navEmoji: { fontSize: 22, width: 32, textAlign: 'center' },
  navText: { flex: 1, gap: 2 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  divider: { height: 1, marginVertical: spacing.sm },
});
