import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { IOS_BANNER_AD_UNIT_ID } from '@/constants/ads';

const adUnitId = __DEV__ ? TestIds.BANNER : IOS_BANNER_AD_UNIT_ID;

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
      <BannerAd unitId={adUnitId} size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
});
