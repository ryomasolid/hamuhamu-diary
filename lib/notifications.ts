import * as Notifications from 'expo-notifications';
import { addDays, parseISO, setHours, startOfDay } from 'date-fns';
import type { Reminder } from '@/types';

/**
 * ローカル通知（サーバー不要）。
 *
 * 状態が変わるたびに「このアプリが出した通知を全部消して作り直す」方式にしている。
 * 件数が少ないので差分管理より単純で壊れにくい。
 */

const REMINDER_HOUR = 9;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** 通知の許可を求める。許可済みなら true */
export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

interface ScheduleOptions {
  reminders: Reminder[];
  remindersEnabled: boolean;
  dailyEnabled: boolean;
  dailyHour: number;
  hamsterName: string | null;
}

export async function rescheduleNotifications({
  reminders,
  remindersEnabled,
  dailyEnabled,
  dailyHour,
  hamsterName,
}: ScheduleOptions): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!remindersEnabled && !dailyEnabled) return;

  const { granted } = await Notifications.getPermissionsAsync();
  if (!granted) return;

  const name = hamsterName ?? 'ハムちゃん';

  if (dailyEnabled) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${name}の今日のお世話 🐹`,
        body: '体重やごはんを記録して、成長を残しておきましょう',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: dailyHour,
        minute: 0,
      },
    });
  }

  if (remindersEnabled) {
    const now = new Date();
    for (const r of reminders) {
      if (!r.lastDate) continue;
      const due = setHours(startOfDay(addDays(parseISO(r.lastDate), r.cycleDays)), REMINDER_HOUR);
      if (due <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${r.emoji} ${r.name}の交換時期です`,
          body: `前回から${r.cycleDays}日たちました。交換したらアプリでリセットしてね`,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: due },
      });
    }
  }
}
