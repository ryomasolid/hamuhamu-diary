import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
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
import * as ImagePicker from 'expo-image-picker';
import { getColors, fontSizes, radii, spacing } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { DateSelector } from '@/components/record/DateSelector';
import { HAMSTER_SPECIES } from '@/constants/defaults';
import { persistPhoto, resolvePhotoUri } from '@/lib/photos';
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

function PhotoPicker({
  photoUri,
  onChange,
}: {
  photoUri: string | null;
  onChange: (uri: string | null) => void;
}) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('権限が必要です', 'カメラロールへのアクセスを許可してください。');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      // 永続領域へコピーし、相対パスを保存する
      const stored = await persistPhoto(result.assets[0].uri);
      onChange(stored);
    }
  };

  const removePhoto = () => {
    Alert.alert('写真を削除', 'プロフィール写真を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => onChange(null) },
    ]);
  };

  return (
    <View style={styles.photoPickerWrap}>
      <Pressable
        onPress={pickPhoto}
        onLongPress={photoUri != null ? removePhoto : undefined}
        style={[
          styles.photoCircle,
          {
            backgroundColor: colors.surfaceSecondary,
            borderColor: colors.border,
          },
        ]}
      >
        {photoUri != null ? (
          <Image source={{ uri: resolvePhotoUri(photoUri) ?? undefined }} style={styles.photoImage} />
        ) : (
          <Text style={styles.photoEmoji}>🐹</Text>
        )}
      </Pressable>
      <Text variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>
        {photoUri != null ? 'タップで変更・長押しで削除' : 'タップして写真を設定'}
      </Text>
    </View>
  );
}

export function ProfileForm({ profile, onSave, isSaving }: ProfileFormProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  const [photoUri, setPhotoUri] = useState<string | null>(profile?.photoUri ?? null);

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
      setPhotoUri(profile.photoUri);
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
      photoUri,
    });
    Alert.alert('保存しました', 'プロフィールを保存しました。');
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <PhotoPicker photoUri={photoUri} onChange={setPhotoUri} />

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
  photoPickerWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  photoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  photoEmoji: {
    fontSize: 20,
  },
  photoBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
