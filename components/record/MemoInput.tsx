import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getColors, fontSizes, radii, spacing } from '@/constants/theme';
import { Text } from '@/components/ui/Text';
import { persistPhoto, resolvePhotoUri } from '@/lib/photos';

interface MemoInputProps {
  memo: string;
  onMemoChange: (val: string) => void;
  photoUri: string | null;
  onPhotoChange: (uri: string | null) => void;
  memoError?: string | undefined;
}

export function MemoInput({
  memo,
  onMemoChange,
  photoUri,
  onPhotoChange,
  memoError,
}: MemoInputProps) {
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
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      // 永続領域へコピーし、相対パスを保存する
      const stored = await persistPhoto(result.assets[0].uri);
      onPhotoChange(stored);
    }
  };

  const removePhoto = () => {
    Alert.alert('写真を削除', '写真を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => onPhotoChange(null) },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 写真 */}
      {photoUri !== null ? (
        <Pressable onPress={removePhoto}>
          <Image
            source={{ uri: resolvePhotoUri(photoUri) ?? undefined }}
            style={[styles.photo, { borderRadius: radii.md }]}
            resizeMode="cover"
          />
          <View style={styles.removeHint}>
            <Text variant="caption" color={colors.textInverse}>
              長押しで削除
            </Text>
          </View>
        </Pressable>
      ) : (
        <Pressable
          onPress={pickPhoto}
          style={[
            styles.photoPlaceholder,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
              borderRadius: radii.md,
            },
          ]}
        >
          <Text style={styles.cameraIcon}>📷</Text>
          <Text variant="caption" color={colors.textSecondary}>
            写真を追加（任意）
          </Text>
        </Pressable>
      )}

      {/* メモ */}
      <TextInput
        value={memo}
        onChangeText={onMemoChange}
        multiline
        numberOfLines={3}
        placeholder="メモを入力してください（任意）&#10;体調の変化、いつもと違う様子など"
        placeholderTextColor={colors.textTertiary}
        style={[
          styles.textarea,
          {
            backgroundColor: colors.surfaceSecondary,
            color: colors.text,
            borderColor: memoError ? colors.error : colors.border,
            borderRadius: radii.md,
            fontSize: fontSizes.md,
          },
        ]}
        textAlignVertical="top"
        accessibilityLabel="メモ"
      />
      {memoError !== undefined && (
        <Text variant="caption" color={colors.error} style={{ marginTop: 4 }}>
          {memoError}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  photoPlaceholder: {
    height: 120,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  cameraIcon: {
    fontSize: 32,
  },
  photo: {
    width: '100%',
    height: 180,
  },
  removeHint: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: spacing.xs,
    alignItems: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  textarea: {
    borderWidth: 1,
    padding: spacing.md,
    minHeight: 80,
  },
});
