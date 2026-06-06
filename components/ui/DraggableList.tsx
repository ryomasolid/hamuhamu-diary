import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { getColors, spacing } from '@/constants/theme';
import { Text } from '@/components/ui/Text';

interface HasId {
  id: string;
}

interface DraggableListProps<T extends HasId> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, isActive: boolean) => React.ReactNode;
  onReorder: (items: T[]) => void;
  onDragStateChange?: (dragging: boolean) => void;
}

export function DraggableList<T extends HasId>({
  items,
  itemHeight,
  renderItem,
  onReorder,
  onDragStateChange,
}: DraggableListProps<T>) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  // ── refs (stale-closure safe in PanResponder) ──────────────
  const activeRef = useRef<number | null>(null);
  const startTopRef = useRef(0);
  const hoverRef = useRef<number | null>(null);
  const itemsRef = useRef(items);
  const onReorderRef = useRef(onReorder);
  const onDragRef = useRef(onDragStateChange);

  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { onReorderRef.current = onReorder; }, [onReorder]);
  useEffect(() => { onDragRef.current = onDragStateChange; }, [onDragStateChange]);

  const dragY = useRef(new Animated.Value(0)).current;

  // ── render state ───────────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // ── activate drag ──────────────────────────────────────────
  const activateRef = useRef((index: number) => {
    activeRef.current = index;
    startTopRef.current = index * itemHeight;
    hoverRef.current = index;
    dragY.setValue(0);
    setActiveIndex(index);
    setHoverIndex(index);
    onDragRef.current?.(true);
  });

  // ── finish drag ────────────────────────────────────────────
  const finishRef = useRef((dy: number) => {
    const from = activeRef.current;
    if (from === null) return;
    const h = itemHeight;
    const len = itemsRef.current.length;
    const to = Math.max(0, Math.min(len - 1,
      Math.round((startTopRef.current + dy) / h),
    ));
    if (from !== to) {
      const next = [...itemsRef.current];
      const [moved] = next.splice(from, 1);
      if (moved !== undefined) next.splice(to, 0, moved);
      onReorderRef.current(next);
    }
    dragY.setValue(0);
    activeRef.current = null;
    hoverRef.current = null;
    setActiveIndex(null);
    setHoverIndex(null);
    onDragRef.current?.(false);
  });

  // keep refs fresh every render (itemHeight might change)
  activateRef.current = (index: number) => {
    activeRef.current = index;
    startTopRef.current = index * itemHeight;
    hoverRef.current = index;
    dragY.setValue(0);
    setActiveIndex(index);
    setHoverIndex(index);
    onDragRef.current?.(true);
  };

  finishRef.current = (dy: number) => {
    const from = activeRef.current;
    if (from === null) return;
    const len = itemsRef.current.length;
    const to = Math.max(0, Math.min(len - 1,
      Math.round((startTopRef.current + dy) / itemHeight),
    ));
    if (from !== to) {
      const next = [...itemsRef.current];
      const [moved] = next.splice(from, 1);
      if (moved !== undefined) next.splice(to, 0, moved);
      onReorderRef.current(next);
    }
    dragY.setValue(0);
    activeRef.current = null;
    hoverRef.current = null;
    setActiveIndex(null);
    setHoverIndex(null);
    onDragRef.current?.(false);
  };

  // ── PanResponder (created once) ────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => activeRef.current !== null,
      onMoveShouldSetPanResponderCapture: () => activeRef.current !== null,
      onPanResponderMove: (_, { dy }) => {
        if (activeRef.current === null) return;
        dragY.setValue(dy);
        const newHover = Math.max(0, Math.min(
          itemsRef.current.length - 1,
          Math.round((startTopRef.current + dy) / itemHeight),
        ));
        if (newHover !== hoverRef.current) {
          hoverRef.current = newHover;
          setHoverIndex(newHover);
        }
      },
      onPanResponderRelease: (_, { dy }) => finishRef.current(dy),
      onPanResponderTerminate: (_, { dy }) => finishRef.current(dy ?? 0),
    })
  ).current;

  // ── compute visual top for non-active items ────────────────
  const visualTop = (index: number): number => {
    if (activeIndex === null || hoverIndex === null || activeIndex === hoverIndex) {
      return index * itemHeight;
    }
    if (index === activeIndex) return activeIndex * itemHeight;
    if (activeIndex < hoverIndex && index > activeIndex && index <= hoverIndex) {
      return (index - 1) * itemHeight;
    }
    if (activeIndex > hoverIndex && index >= hoverIndex && index < activeIndex) {
      return (index + 1) * itemHeight;
    }
    return index * itemHeight;
  };

  return (
    <View
      style={{ height: items.length * itemHeight }}
      {...panResponder.panHandlers}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        return (
          <Animated.View
            key={item.id}
            style={[
              styles.row,
              {
                height: itemHeight,
                top: isActive ? activeIndex! * itemHeight : visualTop(index),
                transform: isActive ? [{ translateY: dragY }] : [],
                zIndex: isActive ? 999 : 1,
                backgroundColor: isActive ? colors.surface : 'transparent',
                shadowOpacity: isActive ? 0.15 : 0,
                elevation: isActive ? 6 : 0,
              },
            ]}
          >
            <View style={styles.content}>
              {renderItem(item, isActive)}
            </View>
            <Pressable
              onLongPress={() => activateRef.current(index)}
              delayLongPress={200}
              hitSlop={8}
              style={styles.handle}
              accessibilityLabel="長押しで並び替え"
            >
              <Text variant="h4" color={colors.textTertiary}>
                ≡
              </Text>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  content: {
    flex: 1,
  },
  handle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
