import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, useColorScheme, ViewStyle, StyleProp } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scheme = useColorScheme();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const bg = scheme === 'dark' ? '#3A3330' : '#E8DDD3';

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: bg,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonGroup({ count = 3, gap = 8 }: { count?: number; gap?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton
          key={i}
          height={i === 0 ? 20 : 16}
          width={i === 0 ? '70%' : `${85 - i * 10}%`}
          style={{ marginBottom: gap }}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
