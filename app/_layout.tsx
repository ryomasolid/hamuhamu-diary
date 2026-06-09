import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import mobileAds from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { getColors } from '@/constants/theme';
import { queryClient } from '@/lib/queryClient';
import { useAppOpenAd } from '@/hooks/useAppOpenAd';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const [adsReady, setAdsReady] = useState(false);

  useAppOpenAd(adsReady);

  useEffect(() => {
    const init = async () => {
      await requestTrackingPermissionsAsync();
      await mobileAds().setRequestConfiguration({
        testDeviceIdentifiers: [
          // 自分のデバイスIDをここに追加（Xcodeログに "To get test ads on this device" として表示される）
          // 例: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        ],
      });
      await mobileAds().initialize();
      setAdsReady(true);
      await SplashScreen.hideAsync();
    };
    void init();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="record"
            options={{
              presentation: 'modal',
              headerShown: false,
              animation: 'slide_from_bottom',
              contentStyle: { backgroundColor: colors.background },
            }}
          />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
