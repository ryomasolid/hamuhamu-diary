import React, { useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { getColors, fontSizes, radii, spacing } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { DateSelector } from '@/components/record/DateSelector';
import { HAMSTER_SPECIES } from '@/constants/defaults';
import type { HamsterProfile } from '@/types';

const profileSchema = z.object({
  name: z
    .string()
    .min(1, '名前を入力してください')
    .max(30, '30文字以内で入力してください'),
  species: z.string().min(1, '種類を入力してください'),
  birthDate: z.string(),
  welcomeDate: z.string(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: HamsterProfile | null;
  onSave: (data: HamsterProfile) => void;
  isSaving: boolean;
}

function FormField({
  label,
  required,
  children,
  error,
}: {
  label: string;
  required?: boolean | undefined;
  children: React.ReactNode;
  error?: string | undefined;
}) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  return (
    <View style={styles.field}>
      <Text variant="label" weight="medium" style={{ marginBottom: spacing.xs }}>
        {label}
        {required === true && (
          <Text variant="caption" color={colors.error}>
            {' '}
            *
          </Text>
        )}
      </Text>
      {children}
      {error !== undefined && (
        <Text variant="caption" color={colors.error} style={{ marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}

export function ProfileForm({ profile, onSave, isSaving }: ProfileFormProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  const today = format(new Date(), 'yyyy-MM-dd');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema) as unknown as Resolver<ProfileFormData>,
    defaultValues: {
      name: profile?.name ?? '',
      species: profile?.species ?? '',
      birthDate: profile?.birthDate ?? today,
      welcomeDate: profile?.welcomeDate ?? today,
    },
  });

  useEffect(() => {
    if (profile) {
      setValue('name', profile.name);
      setValue('species', profile.species);
      setValue('birthDate', profile.birthDate ?? today);
      setValue('welcomeDate', profile.welcomeDate ?? today);
    }
  }, [profile, setValue, today]);

  const onSubmit = (values: ProfileFormData) => {
    const id = profile?.id ?? `profile-${Date.now()}`;
    onSave({
      id,
      name: values.name,
      species: values.species,
      birthDate: values.birthDate,
      welcomeDate: values.welcomeDate,
      photoUri: profile?.photoUri ?? null,
    });
    Alert.alert('保存しました', 'プロフィールを保存しました。');
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <FormField label="名前" required error={errors.name?.message}>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              placeholder="例: ゴールくん"
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceSecondary,
                  color: colors.text,
                  borderColor: errors.name ? colors.error : colors.border,
                  borderRadius: radii.md,
                },
              ]}
            />
          )}
        />
      </FormField>

      <FormField label="種類" required error={errors.species?.message}>
        <Controller
          control={control}
          name="species"
          render={({ field }) => (
            <>
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="例: ゴールデンハムスター"
                placeholderTextColor={colors.textTertiary}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    color: colors.text,
                    borderColor: errors.species ? colors.error : colors.border,
                    borderRadius: radii.md,
                  },
                ]}
              />
              <View style={styles.speciesChips}>
                {HAMSTER_SPECIES.map((sp) => (
                  <Button
                    key={sp}
                    label={sp}
                    variant={watch('species') === sp ? 'solid' : 'outline'}
                    colorScheme={watch('species') === sp ? 'primary' : 'gray'}
                    size="sm"
                    onPress={() => field.onChange(sp)}
                  />
                ))}
              </View>
            </>
          )}
        />
      </FormField>

      <FormField label="誕生日" error={errors.birthDate?.message}>
        <Controller
          control={control}
          name="birthDate"
          render={({ field }) => (
            <DateSelector
              value={field.value}
              onChange={field.onChange}
              error={errors.birthDate?.message}
            />
          )}
        />
      </FormField>

      <FormField label="お迎え日" error={errors.welcomeDate?.message}>
        <Controller
          control={control}
          name="welcomeDate"
          render={({ field }) => (
            <DateSelector
              value={field.value}
              onChange={field.onChange}
              error={errors.welcomeDate?.message}
            />
          )}
        />
      </FormField>

      <Button
        label="プロフィールを保存"
        variant="solid"
        colorScheme="primary"
        onPress={handleSubmit(onSubmit)}
        isLoading={isSaving}
        fullWidth
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSizes.md,
  },
  speciesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
});
