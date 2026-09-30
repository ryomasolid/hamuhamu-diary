import React from 'react';
import { Alert, Linking, Pressable, StyleSheet, Switch, View, useColorScheme } from 'react-native';
import { getColors, radii, spacing } from '@/constants/theme';
import { Text } from '@/components/ui/Text';
import { ensureNotificationPermission } from '@/lib/notifications';
import { useNotificationStore } from '@/store/notificationStore';

const HOURS = [8, 12, 18, 20, 22];

/** 許可が得られなければ設定アプリへ誘導する。許可されれば true */
export async function enableWithPermission(): Promise<boolean> {
  const granted = await ensureNotificationPermission();
  if (!granted) {
    Alert.alert('通知がオフになっています', '設定アプリで「はむ日記」の通知を許可してください。', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '設定を開く', onPress: () => void Linking.openSettings() },
    ]);
  }
  return granted;
}

interface ToggleRowProps {
  emoji: string;
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ emoji, label, description, value, onChange }: ToggleRowProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.text}>
        <Text variant="label" weight="medium">{label}</Text>
        <Text variant="caption" color={colors.textSecondary}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} />
    </View>
  );
}

export function NotificationSettings() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const remindersEnabled = useNotificationStore((s) => s.remindersEnabled);
  const dailyEnabled = useNotificationStore((s) => s.dailyEnabled);
  const dailyHour = useNotificationStore((s) => s.dailyHour);
  const setRemindersEnabled = useNotificationStore((s) => s.setRemindersEnabled);
  const setDailyEnabled = useNotificationStore((s) => s.setDailyEnabled);
  const setDailyHour = useNotificationStore((s) => s.setDailyHour);

  const toggle = (setter: (v: boolean) => void) => (value: boolean) => {
    void (async () => {
      if (value && !(await enableWithPermission())) return;
      setter(value);
    })();
  };

  return (
    <View>
      <ToggleRow
        emoji="🗓️"
        label="交換時期のお知らせ"
        description="フード・床材などの交換日に通知"
        value={remindersEnabled}
        onChange={toggle(setRemindersEnabled)}
      />
      <ToggleRow
        emoji="📝"
        label="毎日の記録リマインド"
        description={`毎日${dailyHour}時に記録をお知らせ`}
        value={dailyEnabled}
        onChange={toggle(setDailyEnabled)}
      />
      {dailyEnabled && (
        <View style={styles.hours}>
          {HOURS.map((h) => (
            <Pressable
              key={h}
              onPress={() => setDailyHour(h)}
              style={[
                styles.hourChip,
                {
                  borderRadius: radii.full,
                  borderColor: h === dailyHour ? colors.primary : colors.border,
                  backgroundColor: h === dailyHour ? colors.primary : 'transparent',
                },
              ]}
            >
              <Text
                variant="caption"
                weight="semibold"
                color={h === dailyHour ? colors.textInverse : colors.textSecondary}
              >
                {h}:00
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  emoji: { fontSize: 22, width: 32, textAlign: 'center' },
  text: { flex: 1, gap: 2 },
  hours: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  hourChip: {
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
});
