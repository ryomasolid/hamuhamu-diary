import React, { useRef, useState } from 'react';
import {
  Alert,
  Modal,
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
import { useSingleFoods, useManageSingleFoods } from '@/hooks/useProfile';
import type { SingleFood } from '@/types';

const ITEM_H = 56;

function EditModal({
  visible,
  initial,
  onSave,
  onDelete,
  onClose,
}: {
  visible: boolean;
  initial: SingleFood | null;
  onSave: (name: string) => void;
  onDelete: (() => void) | null;
  onClose: () => void;
}) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const isNew = initial === null;

  const [name, setName] = useState(initial?.name ?? '');

  React.useEffect(() => {
    setName(initial?.name ?? '');
  }, [initial]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  const handleDelete = () => {
    Alert.alert('削除', `「${initial?.name}」を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: onDelete ?? undefined },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose} />
      <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
        <Text variant="h4" weight="bold" style={{ marginBottom: spacing.md }}>
          {isNew ? 'フードを追加' : 'フードを編集'}
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="フード名（例: チーズ）"
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.textField,
            { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border, borderRadius: radii.sm, fontSize: fontSizes.md, marginBottom: spacing.md },
          ]}
          returnKeyType="done"
          onSubmitEditing={handleSave}
          autoFocus
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
    </Modal>
  );
}

export default function SettingsFoodsScreen() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const foods = useSingleFoods();
  const { add, update, remove, reorder } = useManageSingleFoods();

  const scrollRef = useRef<ScrollView>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<SingleFood | null>(null);

  const openAdd = () => { setEditing(null); setModalVisible(true); };
  const openEdit = (food: SingleFood) => { setEditing(food); setModalVisible(true); };
  const closeModal = () => setModalVisible(false);

  const handleSave = (name: string) => {
    if (editing) {
      update(editing.id, { name });
    } else {
      add({ id: `food-${Date.now()}`, name });
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
        <Text variant="h4" weight="bold">🥕 単体フード</Text>
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
            items={foods}
            itemHeight={ITEM_H}
            onReorder={reorder}
            onDragStateChange={(d) => {
              setScrollEnabled(!d);
              scrollRef.current?.setNativeProps({ scrollEnabled: !d });
            }}
            renderItem={(food) => (
              <Pressable
                onPress={() => openEdit(food)}
                style={[styles.itemContent, { borderBottomColor: colors.border }]}
              >
                <Text variant="label">{food.name}</Text>
                <Text variant="caption" color={colors.textTertiary}>編集 ›</Text>
              </Pressable>
            )}
          />
        </View>

        <Button
          label="＋ フードを追加"
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
