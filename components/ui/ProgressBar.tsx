import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
}

export function ProgressBar({
  progress,
  height = 8,
  color = '#E8804A',
  backgroundColor = '#E8DDD3',
  borderRadius = 999,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.track, { height, backgroundColor, borderRadius }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped * 100}%`,
            height,
            backgroundColor: color,
            borderRadius,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {},
});
