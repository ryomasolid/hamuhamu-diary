import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { getColors } from '@/constants/theme';

function TabIconText({ color, children }: { color: string; children: string }) {
  return (
    <Text style={{ fontSize: 22, color, lineHeight: 26 }} accessible={false}>
      {children}
    </Text>
  );
}

function HomeIcon({ color, focused }: { color: string; focused: boolean }) {
  return focused ? (
    <TabIconText color={color}>🏠</TabIconText>
  ) : (
    <TabIconText color={color}>🏡</TabIconText>
  );
}

function DiaryIcon({ color, focused }: { color: string; focused: boolean }) {
  return focused ? (
    <TabIconText color={color}>📖</TabIconText>
  ) : (
    <TabIconText color={color}>📗</TabIconText>
  );
}

function ProfileIcon({ color, focused }: { color: string; focused: boolean }) {
  return focused ? (
    <TabIconText color={color}>🐹</TabIconText>
  ) : (
    <TabIconText color={color}>🐾</TabIconText>
  );
}

export default function TabLayout() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.surface,
          shadowColor: 'transparent',
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          headerTitle: 'はむはむ日記 🐹',
          tabBarIcon: ({ color, focused }) => (
            <HomeIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: '日記',
          headerTitle: '記録タイムライン 📖',
          tabBarIcon: ({ color, focused }) => (
            <DiaryIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'プロフィール',
          headerTitle: 'プロフィール & 設定 🐹',
          tabBarIcon: ({ color, focused }) => (
            <ProfileIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
