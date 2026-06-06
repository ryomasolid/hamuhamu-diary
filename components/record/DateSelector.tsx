import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import {
  addDays,
  addMonths,
  addYears,
  format,
  getDate,
  getMonth,
  getYear,
  isFuture,
  parseISO,
  subDays,
} from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { getColors, radii, spacing } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

interface DateSelectorProps {
  value: string;
  onChange: (date: string) => void;
  error?: string | undefined;
}

function AdjustRow({
  label,
  onDecrement,
  onIncrement,
}: {
  label: string;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  return (
    <View style={styles.adjustRow}>
      <Pressable
        onPress={onDecrement}
        style={[styles.arrowBtn, { backgroundColor: colors.surfaceSecondary }]}
      >
        <Text variant="h4">‹</Text>
      </Pressable>
      <Text variant="h4" weight="semibold" style={{ minWidth: 80, textAlign: 'center' }}>
        {label}
      </Text>
      <Pressable
        onPress={onIncrement}
        style={[styles.arrowBtn, { backgroundColor: colors.surfaceSecondary }]}
      >
        <Text variant="h4">›</Text>
      </Pressable>
    </View>
  );
}

export function DateSelector({ value, onChange, error }: DateSelectorProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const [visible, setVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(parseISO(value));

  const handleOpen = () => {
    setTempDate(parseISO(value));
    setVisible(true);
  };

  const adjust = (
    type: 'year' | 'month' | 'day',
    delta: number,
  ) => {
    setTempDate((prev) => {
      const next =
        type === 'year'
          ? addYears(prev, delta)
          : type === 'month'
            ? addMonths(prev, delta)
            : addDays(prev, delta);
      return isFuture(next) ? prev : next;
    });
  };

  const handleConfirm = () => {
    onChange(format(tempDate, 'yyyy-MM-dd'));
    setVisible(false);
  };

  const displayDate = format(parseISO(value), 'yyyy年M月d日（EEE）', { locale: ja });

  return (
    <>
      <Pressable
        onPress={handleOpen}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.surfaceSecondary,
            borderColor: error ? colors.error : colors.border,
            borderRadius: radii.md,
          },
        ]}
      >
        <Text variant="label" style={{ flex: 1 }}>
          📅 {displayDate}
        </Text>
        <Text variant="caption" color={colors.textSecondary}>
          変更
        </Text>
      </Pressable>

      {error !== undefined && (
        <Text variant="caption" color={colors.error} style={{ marginTop: 4 }}>
          {error}
        </Text>
      )}

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable
            style={[
              styles.sheet,
              { backgroundColor: colors.surface, borderTopColor: colors.border },
            ]}
            onPress={() => undefined}
          >
            <View style={styles.sheetHeader}>
              <Text variant="h4" weight="bold">
                日付を選択
              </Text>
            </View>

            <AdjustRow
              label={`${getYear(tempDate)}年`}
              onDecrement={() => adjust('year', -1)}
              onIncrement={() => adjust('year', 1)}
            />
            <AdjustRow
              label={`${getMonth(tempDate) + 1}月`}
              onDecrement={() => adjust('month', -1)}
              onIncrement={() => adjust('month', 1)}
            />
            <AdjustRow
              label={`${getDate(tempDate)}日`}
              onDecrement={() => adjust('day', -1)}
              onIncrement={() => adjust('day', 1)}
            />

            <View style={styles.sheetFooter}>
              <View style={{ flex: 1 }}>
                <Button
                  label="今日"
                  variant="ghost"
                  colorScheme="primary"
                  onPress={() => setTempDate(new Date())}
                  fullWidth
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  label="昨日"
                  variant="ghost"
                  colorScheme="gray"
                  onPress={() => setTempDate(subDays(new Date(), 1))}
                  fullWidth
                />
              </View>
            </View>

            <Button
              label="決定"
              variant="solid"
              colorScheme="primary"
              onPress={handleConfirm}
              fullWidth
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: spacing.md,
  },
  sheetHeader: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  adjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  arrowBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
