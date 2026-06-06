import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { getColors, fontSizes, radii, spacing } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import type { PresetMeal, SingleFood } from '@/types';

interface FoodInputProps {
  value: string;
  onChange: (val: string) => void;
  presetMeals: PresetMeal[];
  singleFoods: SingleFood[];
  error?: string | undefined;
}

function PresetModal({
  visible,
  presetMeals,
  onSelect,
  onClose,
}: {
  visible: boolean;
  presetMeals: PresetMeal[];
  onSelect: (meal: PresetMeal) => void;
  onClose: () => void;
}) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
          onPress={() => undefined}
        >
          <Text variant="h4" weight="bold" style={{ marginBottom: spacing.md }}>
            事前登録献立
          </Text>
          {presetMeals.map((meal) => (
            <Pressable
              key={meal.id}
              onPress={() => onSelect(meal)}
              style={[styles.listItem, { borderBottomColor: colors.border }]}
            >
              <Text variant="label" weight="semibold">
                {meal.name}
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                {meal.text}
              </Text>
            </Pressable>
          ))}
          <Button label="閉じる" variant="ghost" colorScheme="gray" onPress={onClose} fullWidth />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SingleFoodModal({
  visible,
  singleFoods,
  onSelect,
  onClose,
}: {
  visible: boolean;
  singleFoods: SingleFood[];
  onSelect: (food: SingleFood) => void;
  onClose: () => void;
}) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const [query, setQuery] = useState('');

  const filtered = singleFoods.filter((f) => f.name.includes(query));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
          onPress={() => undefined}
        >
          <Text variant="h4" weight="bold" style={{ marginBottom: spacing.sm }}>
            単体フードを選択
          </Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="フードを検索..."
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.surfaceSecondary,
                color: colors.text,
                borderColor: colors.border,
                borderRadius: radii.md,
              },
            ]}
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            style={{ maxHeight: 220 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onSelect(item);
                  setQuery('');
                }}
                style={[styles.listItem, { borderBottomColor: colors.border }]}
              >
                <Text variant="label">{item.name}</Text>
              </Pressable>
            )}
          />
          <Button label="閉じる" variant="ghost" colorScheme="gray" onPress={() => { setQuery(''); onClose(); }} fullWidth />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function FoodInput({
  value,
  onChange,
  presetMeals,
  singleFoods,
  error,
}: FoodInputProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const [showPresets, setShowPresets] = useState(false);
  const [showSingleFoods, setShowSingleFoods] = useState(false);

  const appendText = (text: string) => {
    const trimmed = value.trimEnd();
    onChange(trimmed.length > 0 ? `${trimmed}\n${text}` : text);
  };

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChange}
        multiline
        numberOfLines={4}
        placeholder="ごはんの内容を入力してください&#10;（例: ペレット 4g、にんじん少々）"
        placeholderTextColor={colors.textTertiary}
        style={[
          styles.textarea,
          {
            backgroundColor: colors.surfaceSecondary,
            color: colors.text,
            borderColor: error ? colors.error : colors.border,
            borderRadius: radii.md,
            fontSize: fontSizes.md,
          },
        ]}
        textAlignVertical="top"
        accessibilityLabel="ごはん"
      />
      {error !== undefined && (
        <Text variant="caption" color={colors.error} style={{ marginTop: 4 }}>
          {error}
        </Text>
      )}

      <View style={styles.buttonRow}>
        <View style={{ flex: 1 }}>
          <Button
            label="🍱 事前登録献立"
            variant="outline"
            colorScheme="primary"
            size="sm"
            onPress={() => setShowPresets(true)}
            fullWidth
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label="🥕 単体フード"
            variant="outline"
            colorScheme="secondary"
            size="sm"
            onPress={() => setShowSingleFoods(true)}
            fullWidth
          />
        </View>
      </View>

      <PresetModal
        visible={showPresets}
        presetMeals={presetMeals}
        onSelect={(meal) => {
          appendText(meal.text);
          setShowPresets(false);
        }}
        onClose={() => setShowPresets(false)}
      />
      <SingleFoodModal
        visible={showSingleFoods}
        singleFoods={singleFoods}
        onSelect={(food) => {
          appendText(food.name);
          setShowSingleFoods(false);
        }}
        onClose={() => setShowSingleFoods(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  textarea: {
    borderWidth: 1,
    padding: spacing.md,
    minHeight: 100,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
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
    gap: spacing.sm,
  },
  listItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  searchInput: {
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
});
