import { Link, Stack } from 'expo-router';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { getColors, spacing } from '@/constants/theme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

export default function NotFoundScreen() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  return (
    <>
      <Stack.Screen options={{ title: 'Not Found', headerShown: true }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text variant="h2" weight="bold" align="center">
          404
        </Text>
        <Text
          variant="body"
          align="center"
          color={colors.textSecondary}
          style={styles.message}
        >
          このページは存在しません。
        </Text>
        <Link href="/" asChild>
          <Button label="ホームへ戻る" colorScheme="primary" />
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  message: {
    marginVertical: spacing.md,
  },
});
