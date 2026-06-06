import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { AD_BANNER_HEIGHT } from '@/constants/theme';

interface AdBannerProps {
  respectSafeArea?: boolean;
}

export function AdBanner({ respectSafeArea = false }: AdBannerProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: respectSafeArea ? insets.bottom : 0 },
      ]}
    >
      <View style={[styles.banner, { height: AD_BANNER_HEIGHT }]}>
        <Text variant="caption" color="#9E9E9E">
          広告スペース（AdMob BannerAd）
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F0F0',
  },
  banner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8E8E8',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#CCCCCC',
  },
});
