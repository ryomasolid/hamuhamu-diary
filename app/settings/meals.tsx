import React, { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getColors, fontSizes, radii, spacing } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { DraggableList } from '@/components/ui/DraggableList';
import { usePresetMeals, useManagePresetMeals } from '@/hooks/useProfile';
import type { PresetMeal } from '@/types';

const ITEM_H = 64;

function EditModal({
  visible,
  initial,
  onSave,
  onDelete,
  onClose,
}: {
  visible: boolean;
  initial: PresetMeal | null;
  onSave: (name: string, text: string) => void;
  onDelete: (() => void) | null;
  onClose: () => void;
}) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const isNew = initial === null;

  const [name, setName] = useState(initial?.name ?? '');
  const [text, setText] = useState(initial?.text ?? '');

  React.useEffect(() => {
    setName(initial?.name ?? '');
    setText(initial?.text ?? '');
  }, [initial]);

  const handleSave = () => {
    const trimName = name.trim();
    if (!trimName) return;
    onSave(trimName, text.trim() || trimName);
  };

  const handleDelete = () => {
    Alert.alert('削除', `「${initial?.name}」を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: onDelete ?? undefined },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          <Text variant="h4" weight="bold" style={{ marginBottom: spacing.md }}>
            {isNew ? '献立を追加' : '献立を編集'}
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="名前（例: いつものペレット）"
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.textField,
              { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border, borderRadius: radii.sm, fontSize: fontSizes.md, marginBottom: spacing.sm },
            ]}
            autoFocus
          />
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="内容（例: ペレット 4g + にんじん少々）"
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.textField,
              { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border, borderRadius: radii.sm, fontSize: fontSizes.md, marginBottom: spacing.md },
            ]}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          <View style={styles.modalActions}>
            {!isNew && onDelete && (
              <Button label="削除" variant="outline" colorScheme="error" size="md" onPress={handleDelete} />
            )}
            <View style={styles.modalActionsRight}>
              <Button label="キャンセル" variant="ghost" colorScheme="gray" size="md" onPress={onClose} />
              <Button label={isNew ? '追加' : '保存'} variant="solid" colorScheme="primary" size="md" onPress={handleSave} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function SettingsMealsScreen() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const meals = usePresetMeals();
  const { add, update, remove, reorder } = useManagePresetMeals();

  const scrollRef = useRef<ScrollView>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<PresetMeal | null>(null);

  const openAdd = () => { setEditing(null); setModalVisible(true); };
  const openEdit = (meal: PresetMeal) => { setEditing(meal); setModalVisible(true); };
  const closeModal = () => setModalVisible(false);

  const handleSave = (name: string, text: string) => {
    if (editing) {
      update(editing.id, { name, text });
    } else {
      add({ id: `meal-${Date.now()}`, name, text });
    }
    closeModal();
  };

  const handleDelete = editing ? () => { remove(editing.id); closeModal(); } : null;

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn} hitSlop={8}>
          <Text variant="label" color={colors.primary}>‹ 戻る</Text>
        </Pressable>
        <Text variant="h4" weight="bold">🌾 事前登録献立</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        ref={scrollRef}
        scrollEnabled={scrollEnabled}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="caption" color={colors.textSecondary} style={styles.hint}>
          ≡ を長押しして並び替え、行をタップして編集
        </Text>

        <View style={[styles.listCard, { backgroundColor: colors.surface, borderRadius: radii.lg }]}>
          <DraggableList
            items={meals}
            itemHeight={ITEM_H}
            onReorder={reorder}
            onDragStateChange={(d) => {
              setScrollEnabled(!d);
              scrollRef.current?.setNativeProps({ scrollEnabled: !d });
            }}
            renderItem={(meal) => (
              <Pressable
                onPress={() => openEdit(meal)}
                style={[styles.itemContent, { borderBottomColor: colors.border }]}
              >
                <View style={styles.itemText}>
                  <Text variant="label" weight="medium">{meal.name}</Text>
                  {meal.text !== meal.name && (
                    <Text variant="caption" color={colors.textSecondary} numberOfLines={1}>
                      {meal.text}
                    </Text>
                  )}
                </View>
                <Text variant="caption" color={colors.textTertiary}>編集 ›</Text>
              </Pressable>
            )}
          />
        </View>

        <Button
          label="＋ 献立を追加"
          variant="outline"
          colorScheme="primary"
          size="md"
          fullWidth
          onPress={openAdd}
        />
      </ScrollView>

      <EditModal
        visible={modalVisible}
        initial={editing}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: { minWidth: 64 },
  scroll: { padding: spacing.md, gap: spacing.md },
  hint: { textAlign: 'center' },
  listCard: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemText: { flex: 1, gap: 2, marginRight: spacing.sm },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: spacing.lg,
  },
  modalSheet: {
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  textField: {
    height: 48,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalActionsRight: { flexDirection: 'row', gap: spacing.sm },
});
