import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { getColors } from '@/constants/theme';
import { queryClient } from '@/lib/queryClient';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  useEffect(() => {
    SplashScreen.hideAsync();
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
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
