import { useEffect, useRef, useCallback } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { AppOpenAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { IOS_APP_OPEN_AD_UNIT_ID } from '@/constants/ads';

const AD_UNIT_ID = __DEV__ ? TestIds.APP_OPEN : IOS_APP_OPEN_AD_UNIT_ID;
const COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4時間に1回まで

export function useAppOpenAd(adsReady: boolean) {
  const adRef = useRef<AppOpenAd | null>(null);
  const isLoadingRef = useRef(false);
  const lastShownAt = useRef(0);

  const showIfReady = useCallback(() => {
    const now = Date.now();
    if (adRef.current && now - lastShownAt.current > COOLDOWN_MS) {
      lastShownAt.current = now;
      adRef.current.show();
    }
  }, []);

  const loadAd = useCallback(() => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    const ad = AppOpenAd.createForAdRequest(AD_UNIT_ID);

    ad.addAdEventListener(AdEventType.LOADED, () => {
      adRef.current = ad;
      isLoadingRef.current = false;
      showIfReady(); // 起動直後のロード完了時に即表示
    });

    ad.addAdEventListener(AdEventType.ERROR, () => {
      adRef.current = null;
      isLoadingRef.current = false;
    });

    ad.addAdEventListener(AdEventType.CLOSED, () => {
      adRef.current = null;
      loadAd(); // 閉じたら次をプリロード
    });

    ad.load();
  }, [showIfReady]);

  useEffect(() => {
    if (!adsReady) return;
    loadAd();

    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') showIfReady();
    });

    return () => subscription.remove();
  }, [adsReady, loadAd, showIfReady]);
}
