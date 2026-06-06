import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DailyRecord } from '@/types';

interface RecordStore {
  records: DailyRecord[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  addRecord: (record: DailyRecord) => void;
  updateRecord: (id: string, updates: Partial<Omit<DailyRecord, 'id' | 'createdAt'>>) => void;
  deleteRecord: (id: string) => void;
  getLatestRecord: () => DailyRecord | null;
  getLastCleaningDate: () => string | null;
}

export const useRecordStore = create<RecordStore>()(
  persist(
    (set, get) => ({
      records: [],
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      addRecord: (record) =>
        set((state) => ({ records: [record, ...state.records] })),

      updateRecord: (id, updates) =>
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id
              ? { ...r, ...updates, updatedAt: new Date().toISOString() }
              : r,
          ),
        })),

      deleteRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),

      getLatestRecord: () => {
        const { records } = get();
        return records[0] ?? null;
      },

      getLastCleaningDate: () => {
        const { records } = get();
        const withCleaning = records.find((r) => r.cleaningTaskIds.length > 0);
        return withCleaning?.date ?? null;
      },
    }),
    {
      name: 'hamu-records',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
