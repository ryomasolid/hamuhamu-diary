import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getColors, spacing } from '@/constants/theme';
import { BaseComponentProps } from '@/types';

interface BaseLayoutProps extends BaseComponentProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padded?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  keyboardAvoiding?: boolean;
}

export function BaseLayout({
  children,
  scrollable = true,
  padded = true,
  edges = ['top', 'bottom', 'left', 'right'],
  keyboardAvoiding = true,
  style,
  testID,
}: BaseLayoutProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  const content = (
    <SafeAreaView
      edges={edges}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      testID={testID}
    >
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            padded && styles.padded,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={style}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.fill, padded && styles.padded, style]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );

  if (!keyboardAvoiding) return content;

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
