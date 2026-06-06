import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { differenceInMonths, differenceInYears, parseISO } from 'date-fns';
import { getColors, radii, spacing, AD_BANNER_HEIGHT } from '@/constants/theme';
import { AdBanner } from '@/components/ui/AdBanner';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ReminderCard } from '@/components/profile/ReminderCard';
import { useProfile, useSaveProfile } from '@/hooks/useProfile';
import { useReminders } from '@/hooks/useReminders';
import type { HamsterProfile } from '@/types';

function calculateAge(birthDate: string): string {
  const birth = parseISO(birthDate);
  const now = new Date();
  const years = differenceInYears(now, birth);
  const months = differenceInMonths(now, birth) - years * 12;
  if (years === 0 && months === 0) return '0ヶ月';
  if (years === 0) return `${months}ヶ月`;
  if (months === 0) return `${years}歳`;
  return `${years}歳${months}ヶ月`;
}

function ProfileHeaderCard({
  profile,
  onEdit,
}: {
  profile: HamsterProfile;
  onEdit: () => void;
}) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const age = profile.birthDate ? calculateAge(profile.birthDate) : null;

  return (
    <Card>
      <View style={styles.profileHeader}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: colors.surfaceSecondary, borderRadius: radii.full },
          ]}
        >
          {profile.photoUri != null ? (
            <Image
              source={{ uri: profile.photoUri }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={{ fontSize: 20 }}>🐹</Text>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text variant="h3" weight="bold">
            {profile.name}
          </Text>
          <Text variant="bodySmall" color={colors.textSecondary}>
            {profile.species}
          </Text>
          {age !== null && (
            <Text variant="bodySmall" color={colors.primary} weight="medium">
              {age}
            </Text>
          )}
        </View>
        <Button
          label="編集"
          variant="outline"
          colorScheme="primary"
          size="sm"
          onPress={onEdit}
        />
      </View>

      <View style={[styles.infoGrid, { borderTopColor: colors.border }]}>
        {profile.birthDate !== null && (
          <View style={styles.infoItem}>
            <Text variant="caption" color={colors.textSecondary}>
              誕生日
            </Text>
            <Text variant="label" weight="medium">
              {profile.birthDate.replace(/-/g, '/')}
            </Text>
          </View>
        )}
        {profile.welcomeDate !== null && (
          <View style={styles.infoItem}>
            <Text variant="caption" color={colors.textSecondary}>
              お迎え日
            </Text>
            <Text variant="label" weight="medium">
              {profile.welcomeDate.replace(/-/g, '/')}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const [isEditing, setIsEditing] = useState(false);

  const { profile, isLoading: profileLoading } = useProfile();
  const { mutate: saveProfile, isPending: isSaving } = useSaveProfile();
  const { reminders, isLoading: remindersLoading, resetReminderDate } = useReminders();

  const handleSave = (data: HamsterProfile) => {
    saveProfile(data);
    setIsEditing(false);
  };

  if (profileLoading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={{ padding: spacing.md, gap: spacing.md }}>
          <Skeleton height={120} borderRadius={16} />
          <Skeleton height={80} borderRadius={16} />
          <Skeleton height={80} borderRadius={16} />
        </View>
        <AdBanner />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: AD_BANNER_HEIGHT + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* プロフィールカード or 編集フォーム */}
        {isEditing || profile === null ? (
          <Card>
            <Text variant="h4" weight="bold" style={{ marginBottom: spacing.md }}>
              {profile === null ? '🐹 プロフィールを登録' : 'プロフィールを編集'}
            </Text>
            <ProfileForm
              profile={profile}
              onSave={handleSave}
              isSaving={isSaving}
            />
            {profile !== null && (
              <Button
                label="キャンセル"
                variant="ghost"
                colorScheme="gray"
                onPress={() => setIsEditing(false)}
                fullWidth
              />
            )}
          </Card>
        ) : (
          <ProfileHeaderCard profile={profile} onEdit={() => setIsEditing(true)} />
        )}

        {/* カスタマイズ設定へのリンク */}
        <Pressable
          onPress={() => router.push('/(tabs)/settings')}
          style={({ pressed }) => [
            styles.settingsLink,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radii.md,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text variant="label" weight="semibold">
            ⚙️ カスタマイズ設定
          </Text>
          <Text variant="caption" color={colors.textSecondary}>
            お掃除項目・献立・フードを編集
          </Text>
          <Text variant="h4" color={colors.textTertiary} style={styles.chevron}>
            ›
          </Text>
        </Pressable>

        {/* リマインダーセクション */}
        <View>
          <Text variant="h4" weight="semibold" style={{ marginBottom: spacing.sm }}>
            🗓️ フード・消耗品管理
          </Text>
          <Text variant="bodySmall" color={colors.textSecondary} style={{ marginBottom: spacing.md }}>
            「リセット」を押すと交換日が今日に更新されます
          </Text>

          {remindersLoading ? (
            <View style={{ gap: spacing.sm }}>
              <Skeleton height={100} borderRadius={16} />
              <Skeleton height={100} borderRadius={16} />
            </View>
          ) : (
            reminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onReset={resetReminderDate}
              />
            ))
          )}
        </View>
      </ScrollView>

      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  infoItem: {
    gap: 2,
  },
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  chevron: {
    marginLeft: 'auto',
  },
});
