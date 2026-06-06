import { differenceInDays, parseISO } from 'date-fns';
import { useReminderStore } from '@/store/reminderStore';
import type { Reminder } from '@/types';

export interface ReminderWithProgress extends Reminder {
  daysPassed: number;
  progress: number;
  isOverdue: boolean;
  isWarning: boolean;
}

function computeProgress(reminder: Reminder): ReminderWithProgress {
  if (!reminder.lastDate) {
    return {
      ...reminder,
      daysPassed: reminder.cycleDays,
      progress: 1,
      isOverdue: true,
      isWarning: true,
    };
  }
  const daysPassed = differenceInDays(new Date(), parseISO(reminder.lastDate));
  const progress = Math.min(daysPassed / reminder.cycleDays, 1);
  return {
    ...reminder,
    daysPassed,
    progress,
    isOverdue: daysPassed >= reminder.cycleDays,
    isWarning: daysPassed >= reminder.cycleDays * 0.8,
  };
}

export function useReminders() {
  const reminders = useReminderStore((s) => s.reminders);
  const _hasHydrated = useReminderStore((s) => s._hasHydrated);
  const resetReminderDate = useReminderStore((s) => s.resetReminderDate);

  const remindersWithProgress = reminders.map(computeProgress);
  const overdueCount = remindersWithProgress.filter((r) => r.isOverdue).length;

  return {
    reminders: remindersWithProgress,
    overdueCount,
    isLoading: !_hasHydrated,
    resetReminderDate,
  };
}
