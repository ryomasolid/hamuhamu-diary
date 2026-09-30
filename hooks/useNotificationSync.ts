import { useEffect } from 'react';
import { rescheduleNotifications } from '@/lib/notifications';
import { useNotificationStore } from '@/store/notificationStore';
import { useProfileStore } from '@/store/profileStore';
import { useReminderStore } from '@/store/reminderStore';

/** リマインダーや通知設定が変わったら、予約済みのローカル通知を作り直す */
export function useNotificationSync() {
  const reminders = useReminderStore((s) => s.reminders);
  const remindersHydrated = useReminderStore((s) => s._hasHydrated);
  const remindersEnabled = useNotificationStore((s) => s.remindersEnabled);
  const dailyEnabled = useNotificationStore((s) => s.dailyEnabled);
  const dailyHour = useNotificationStore((s) => s.dailyHour);
  const settingsHydrated = useNotificationStore((s) => s._hasHydrated);
  const hamsterName = useProfileStore((s) => s.profile?.name ?? null);

  useEffect(() => {
    if (!remindersHydrated || !settingsHydrated) return;
    rescheduleNotifications({
      reminders,
      remindersEnabled,
      dailyEnabled,
      dailyHour,
      hamsterName,
    }).catch(() => undefined);
  }, [reminders, remindersHydrated, remindersEnabled, dailyEnabled, dailyHour, settingsHydrated, hamsterName]);
}
