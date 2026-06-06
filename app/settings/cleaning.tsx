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
import { useCleaningOptions, useManageCleaningOptions } from '@/hooks/useProfile';
import type { CleaningOption } from '@/types';

const ITEM_H = 56;

function EditModal({
  visible,
  initial,
  onSave,
  onDelete,
  onClose,
}: {
  visible: boolean;
  initial: CleaningOption | null;
  onSave: (emoji: string, name: string) => void;
  onDelete: (() => void) | null;
  onClose: () => void;
}) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const isNew = initial === null;

  const [emoji, setEmoji] = useState(initial?.emoji ?? '');
  const [name, setName] = useState(initial?.name ?? '');

  React.useEffect(() => {
    setEmoji(initial?.emoji ?? '');
    setName(initial?.name ?? '');
  }, [initial]);

  const handleSave = () => {
    const trimName = name.trim();
    if (!trimName) return;
    onSave(emoji.trim() || '🧹', trimName);
  };

  const handleDelete = () => {
    Alert.alert('削除', `「${initial?.emoji} ${initial?.name}」を削除しますか？`, [
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
            {isNew ? '項目を追加' : '項目を編集'}
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              value={emoji}
              onChangeText={setEmoji}
              placeholder="🧹"
              maxLength={2}
              style={[
                styles.emojiInput,
                { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border, borderRadius: radii.sm, fontSize: fontSizes.xl },
              ]}
            />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="項目名"
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.nameInput,
                { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border, borderRadius: radii.sm, fontSize: fontSizes.md },
              ]}
              returnKeyType="done"
              onSubmitEditing={handleSave}
              autoFocus
            />
          </View>

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

export default function SettingsCleaningScreen() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const options = useCleaningOptions();
  const { add, update, remove, reorder } = useManageCleaningOptions();

  const scrollRef = useRef<ScrollView>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<CleaningOption | null>(null);

  const openAdd = () => {
    setEditing(null);
    setModalVisible(true);
  };

  const openEdit = (opt: CleaningOption) => {
    setEditing(opt);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const handleSave = (emoji: string, name: string) => {
    if (editing) {
      update(editing.id, { emoji, name });
    } else {
      add({ id: `cleaning-${Date.now()}`, emoji, name });
    }
    closeModal();
  };

  const handleDelete = editing
    ? () => { remove(editing.id); closeModal(); }
    : null;

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn} hitSlop={8}>
          <Text variant="label" color={colors.primary}>‹ 戻る</Text>
        </Pressable>
        <Text variant="h4" weight="bold">🧹 お掃除項目</Text>
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
            items={options}
            itemHeight={ITEM_H}
            onReorder={reorder}
            onDragStateChange={(d) => {
              setScrollEnabled(!d);
              scrollRef.current?.setNativeProps({ scrollEnabled: !d });
            }}
            renderItem={(opt) => (
              <Pressable
                onPress={() => openEdit(opt)}
                style={[styles.itemContent, { borderBottomColor: colors.border }]}
              >
                <Text variant="label">{opt.emoji}  {opt.name}</Text>
                <Text variant="caption" color={colors.textTertiary}>編集 ›</Text>
              </Pressable>
            )}
          />
        </View>

        <Button
          label="＋ 項目を追加"
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
  inputRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  emojiInput: {
    width: 56,
    height: 48,
    borderWidth: 1,
    textAlign: 'center',
  },
  nameInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  modalActionsRight: { flexDirection: 'row', gap: spacing.sm },
});
