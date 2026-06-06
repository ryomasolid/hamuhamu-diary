import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import type { Reminder } from '@/types';
import { DEFAULT_REMINDERS } from '@/constants/defaults';

interface ReminderStore {
  reminders: Reminder[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  resetReminderDate: (id: string) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
}

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set) => ({
      reminders: DEFAULT_REMINDERS,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      resetReminderDate: (id) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id
              ? { ...r, lastDate: format(new Date(), 'yyyy-MM-dd') }
              : r,
          ),
        })),

      updateReminder: (id, updates) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, ...updates } : r,
          ),
        })),
    }),
    {
      name: 'hamu-reminders',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
