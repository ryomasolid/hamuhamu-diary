import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { BaseLayout } from '@/components/BaseLayout';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { getColors, spacing } from '@/constants/theme';
import {
  exportAndShare,
  pickBackupFile,
  restorePhotos,
  mergeRecords,
  mergeReminders,
} from '@/lib/dataSync';
import { useRecordStore } from '@/store/recordStore';
import { useReminderStore } from '@/store/reminderStore';

interface NavRowProps {
  emoji: string;
  label: string;
  description: string;
  onPress: () => void;
  disabled?: boolean;
}

function NavRow({ emoji, label, description, onPress, disabled = false }: NavRowProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.navRow,
        { borderBottomColor: colors.border, opacity: pressed && !disabled ? 0.7 : disabled ? 0.4 : 1 },
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
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const setRecords = useRecordStore((s) => s.setRecords);
  const setReminders = useReminderStore((s) => s.setReminders);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportAndShare();
    } catch {
      Alert.alert('エラー', 'データの書き出しに失敗しました。');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);
      const data = await pickBackupFile();
      setIsImporting(false);

      if (!data) return;

      const currentRecords = useRecordStore.getState().records;
      const currentReminders = useReminderStore.getState().reminders;

      // 件数の確認だけ先に行い、ユーザーに提示する
      const { addedCount, updatedCount } = mergeRecords(
        currentRecords,
        data.records.map(({ photoData: _pd, ...r }) => r),
      );
      const mergedReminders = mergeReminders(currentReminders, data.reminders);

      const total = addedCount + updatedCount;
      if (total === 0) {
        Alert.alert('取り込み結果', '新しいデータはありませんでした。');
        return;
      }

      Alert.alert(
        'データを取り込む',
        `${addedCount}件追加、${updatedCount}件を新しい内容に更新します。よろしいですか？`,
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: '取り込む',
            onPress: async () => {
              try {
                // 確定後に写真を保存してからマージ
                const restoredRecords = await restorePhotos(data.records);
                const { records: mergedRecords } = mergeRecords(currentRecords, restoredRecords);
                setRecords(mergedRecords);
                setReminders(mergedReminders);
                Alert.alert('完了', `${total}件のデータを取り込みました🐹`);
              } catch {
                Alert.alert('エラー', '写真の保存中にエラーが発生しました。');
              }
            },
          },
        ],
      );
    } catch (err) {
      setIsImporting(false);
      const message =
        err instanceof Error && err.message === 'invalid_format'
          ? 'ファイルの形式が正しくありません。はむはむ日記のバックアップファイルを選択してください。'
          : 'データの読み込みに失敗しました。';
      Alert.alert('エラー', message);
    }
  };

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

      <Card style={styles.card}>
        <Text variant="h4" weight="semibold" style={{ marginBottom: spacing.sm }}>
          データ管理
        </Text>
        <Text variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing.sm }}>
          同居人とデータを共有したり、バックアップを作成できます
        </Text>
        <NavRow
          emoji="📤"
          label="データを送る"
          description={isExporting ? '書き出し中...' : 'AirDropやLINEで同居人に送る'}
          onPress={handleExport}
          disabled={isExporting}
        />
        <NavRow
          emoji="📥"
          label="データを取り込む"
          description={isImporting ? '読み込み中...' : '受け取ったファイルと日記を合体させる'}
          onPress={handleImport}
          disabled={isImporting}
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
