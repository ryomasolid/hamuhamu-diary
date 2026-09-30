import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationStore {
  /** 消耗品の交換時期を通知する */
  remindersEnabled: boolean;
  /** 毎日決まった時刻に記録を促す */
  dailyEnabled: boolean;
  /** 毎日の通知時刻（時） */
  dailyHour: number;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setRemindersEnabled: (enabled: boolean) => void;
  setDailyEnabled: (enabled: boolean) => void;
  setDailyHour: (hour: number) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      remindersEnabled: false,
      dailyEnabled: false,
      dailyHour: 20,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setRemindersEnabled: (remindersEnabled) => set({ remindersEnabled }),
      setDailyEnabled: (dailyEnabled) => set({ dailyEnabled }),
      setDailyHour: (dailyHour) => set({ dailyHour }),
    }),
    {
      name: 'hamu-notifications',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ remindersEnabled, dailyEnabled, dailyHour }) => ({
        remindersEnabled,
        dailyEnabled,
        dailyHour,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
