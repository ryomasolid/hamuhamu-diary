import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { IOS_BANNER_AD_UNIT_ID } from '@/constants/ads';
import { SCREENSHOT_MODE } from '@/constants/app';

const adUnitId = __DEV__ ? TestIds.BANNER : IOS_BANNER_AD_UNIT_ID;

export function AdBanner() {
  if (SCREENSHOT_MODE) return null;

  return (
    <View style={styles.container}>
      <BannerAd unitId={adUnitId} size={BannerAdSize.INLINE_ADAPTIVE_BANNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
});
