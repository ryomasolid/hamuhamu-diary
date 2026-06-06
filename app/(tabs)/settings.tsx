import { StyleSheet, Switch, View, useColorScheme } from 'react-native';
import { BaseLayout } from '@/components/BaseLayout';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { getColors, spacing } from '@/constants/theme';
import { useBoolean } from '@/hooks/useBoolean';

interface SettingRowProps {
  label: string;
  description?: string;
  value: boolean;
  onToggle: () => void;
}

function SettingRow({ label, description, value, onToggle }: SettingRowProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text variant="label" weight="medium">
          {label}
        </Text>
        {description != null && (
          <Text variant="caption" color={colors.textSecondary}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.surface}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const notifications = useBoolean(true);
  const analytics = useBoolean(false);
  const darkMode = useBoolean(scheme === 'dark');

  return (
    <BaseLayout>
      <Text variant="h3" weight="bold">
        設定
      </Text>
      <Text
        variant="body"
        color={colors.textSecondary}
        style={styles.subtitle}
      >
        アプリの動作をカスタマイズしてください。
      </Text>

      <Card style={styles.card}>
        <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
          通知
        </Text>
        <SettingRow
          label="プッシュ通知"
          description="新着情報をプッシュ通知で受け取る"
          value={notifications.value}
          onToggle={notifications.toggle}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingRow
          label="アナリティクス"
          description="使用状況データの収集に同意する"
          value={analytics.value}
          onToggle={analytics.toggle}
        />
      </Card>

      <Card style={styles.card}>
        <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
          表示
        </Text>
        <SettingRow
          label="ダークモード"
          description="システム設定とは独立して切り替える"
          value={darkMode.value}
          onToggle={darkMode.toggle}
        />
      </Card>

      <Card style={styles.card} elevated={false} bordered>
        <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
          アプリ情報
        </Text>
        <View style={styles.infoRow}>
          <Text variant="label" color={colors.textSecondary}>
            バージョン
          </Text>
          <Text variant="label" weight="medium">
            1.0.0
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.infoRow}>
          <Text variant="label" color={colors.textSecondary}>
            ビルド
          </Text>
          <Text variant="label" weight="medium">
            1
          </Text>
        </View>
      </Card>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  rowText: {
    flex: 1,
    marginRight: spacing.md,
    gap: 2,
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
});
