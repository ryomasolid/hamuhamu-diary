import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { getColors, spacing, radii } from '@/constants/theme';
import { AdBanner } from '@/components/ui/AdBanner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { DateSelector } from '@/components/record/DateSelector';
import { WeightInput } from '@/components/record/WeightInput';
import { FoodInput } from '@/components/record/FoodInput';
import { CleaningInput } from '@/components/record/CleaningInput';
import { MemoInput } from '@/components/record/MemoInput';
import { useAddRecord, useUpdateRecord } from '@/hooks/useRecords';
import { usePresetMeals, useSingleFoods, useCleaningOptions } from '@/hooks/useProfile';
import { useRecordStore } from '@/store/recordStore';

const recordSchema = z.object({
  date: z.string().min(1, '日付を選択してください'),
  weight: z.string().refine(
    (val) => {
      if (val === '') return true;
      const n = parseFloat(val);
      return !isNaN(n) && n >= 0 && n <= 999.9;
    },
    { message: '0〜999.9 の範囲で入力してください' },
  ),
  food: z.string(),
  cleaningTaskIds: z.array(z.string()),
  memo: z.string().max(500, '500文字以内で入力してください'),
  photoUri: z.string().nullable(),
});

type RecordFormData = z.infer<typeof recordSchema>;

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

function FormSection({ title, children }: FormSectionProps) {
  return (
    <Card style={styles.section}>
      <Text variant="label" weight="semibold" style={{ marginBottom: spacing.sm }}>
        {title}
      </Text>
      {children}
    </Card>
  );
}

export default function RecordScreen() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const { id } = useLocalSearchParams<{ id?: string }>();

  const records = useRecordStore((s) => s.records);
  const existingRecord = id ? (records.find((r) => r.id === id) ?? null) : null;
  const isEditing = existingRecord !== null;

  const { mutate: addRecord, isPending: isAdding } = useAddRecord();
  const { mutate: updateRecord, isPending: isUpdating } = useUpdateRecord();
  const isPending = isAdding || isUpdating;
  const presetMeals = usePresetMeals();
  const singleFoods = useSingleFoods();
  const cleaningOptions = useCleaningOptions();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecordFormData>({
    // zodResolver + exactOptionalPropertyTypes: type cast required for compatibility
    resolver: zodResolver(recordSchema) as unknown as Resolver<RecordFormData>,
    defaultValues: existingRecord
      ? {
          date: existingRecord.date,
          weight: existingRecord.weight != null ? String(existingRecord.weight) : '',
          food: existingRecord.food,
          cleaningTaskIds: existingRecord.cleaningTaskIds,
          memo: existingRecord.memo,
          photoUri: existingRecord.photoUri,
        }
      : {
          date: format(new Date(), 'yyyy-MM-dd'),
          weight: '',
          food: '',
          cleaningTaskIds: [],
          memo: '',
          photoUri: null,
        },
  });

  const onSubmit = (values: RecordFormData) => {
    const weight = values.weight !== '' ? parseFloat(values.weight) : null;

    if (isEditing && existingRecord) {
      updateRecord(
        {
          id: existingRecord.id,
          updates: {
            date: values.date,
            weight,
            food: values.food,
            cleaningTaskIds: values.cleaningTaskIds,
            memo: values.memo,
            photoUri: values.photoUri,
          },
        },
        {
          onSuccess: () => {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('更新しました！', `${values.date} の記録を更新しました。`, [
              { text: 'OK', onPress: () => router.back() },
            ]);
          },
          onError: () => {
            Alert.alert('エラー', '記録の更新に失敗しました。もう一度お試しください。');
          },
        },
      );
      return;
    }

    const record = {
      id: `record-${Date.now()}`,
      date: values.date,
      weight,
      food: values.food,
      cleaningTaskIds: values.cleaningTaskIds,
      memo: values.memo,
      photoUri: values.photoUri,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addRecord(record, {
      onSuccess: () => {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('記録しました！', `${values.date} の記録を保存しました。`, [
          { text: 'OK', onPress: () => router.back() },
        ]);
      },
      onError: () => {
        Alert.alert('エラー', '記録の保存に失敗しました。もう一度お試しください。');
      },
    });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* ヘッダー */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.surface, borderBottomColor: colors.border },
          ]}
        >
          <Pressable onPress={handleCancel} style={styles.headerBtn}>
            <Text variant="label" color={colors.textSecondary}>
              キャンセル
            </Text>
          </Pressable>
          <Text variant="h4" weight="bold">
            {isEditing ? '記録を編集 ✏️' : '記録する 📝'}
          </Text>
          <View style={styles.headerBtn} />
        </View>

        {/* フォーム */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 日付 */}
          <FormSection title="📅 日付">
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <DateSelector
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.date?.message}
                />
              )}
            />
          </FormSection>

          {/* 体重 */}
          <FormSection title="⚖️ 体重（任意）">
            <Controller
              control={control}
              name="weight"
              render={({ field }) => (
                <WeightInput
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={errors.weight?.message}
                />
              )}
            />
          </FormSection>

          {/* ごはん */}
          <FormSection title="🌾 ごはん（任意）">
            <Controller
              control={control}
              name="food"
              render={({ field }) => (
                <FoodInput
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  presetMeals={presetMeals}
                  singleFoods={singleFoods}
                  error={errors.food?.message}
                />
              )}
            />
          </FormSection>

          {/* 掃除 */}
          <FormSection title="🧹 今日のお掃除（任意）">
            <Controller
              control={control}
              name="cleaningTaskIds"
              render={({ field }) => (
                <CleaningInput
                  selectedIds={field.value}
                  onChange={field.onChange}
                  options={cleaningOptions}
                  error={errors.cleaningTaskIds?.message}
                />
              )}
            />
          </FormSection>

          {/* メモ・写真 */}
          <FormSection title="📷 写真・メモ（任意）">
            <MemoInput
              memo={watch('memo') ?? ''}
              onMemoChange={(val) => setValue('memo', val)}
              photoUri={watch('photoUri') ?? null}
              onPhotoChange={(uri) => setValue('photoUri', uri)}
              memoError={errors.memo?.message}
            />
          </FormSection>

          {/* 保存ボタン */}
          <View style={[styles.saveArea, { borderRadius: radii.lg }]}>
            <Button
              label={isEditing ? '💾 更新する' : '💾 保存する'}
              variant="solid"
              colorScheme="primary"
              size="lg"
              onPress={handleSubmit(onSubmit)}
              isLoading={isPending}
              fullWidth
            />
          </View>
        </ScrollView>

        <AdBanner respectSafeArea />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    minWidth: 64,
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    gap: spacing.xs,
  },
  saveArea: {
    marginTop: spacing.md,
  },
});
