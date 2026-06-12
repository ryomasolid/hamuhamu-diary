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
  setRecords: (records: DailyRecord[]) => void;
  getLatestRecord: () => DailyRecord | null;
  getLastCleaningDate: () => string | null;
}

// date(YYYY-MM-DD)の降順、同日ならcreatedAtの降順で並べる
const sortByDateDesc = (records: DailyRecord[]) =>
  [...records].sort(
    (a, b) =>
      b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  );

export const useRecordStore = create<RecordStore>()(
  persist(
    (set, get) => ({
      records: [],
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      addRecord: (record) =>
        set((state) => ({
          records: sortByDateDesc([record, ...state.records]),
        })),

      updateRecord: (id, updates) =>
        set((state) => ({
          records: sortByDateDesc(
            state.records.map((r) =>
              r.id === id
                ? { ...r, ...updates, updatedAt: new Date().toISOString() }
                : r,
            ),
          ),
        })),

      deleteRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),

      setRecords: (records) => set({ records: sortByDateDesc(records) }),

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
        if (state) {
          // 過去バージョンで保存された未ソートのデータを並べ直す
          state.setRecords(state.records);
          state.setHasHydrated(true);
        }
      },
    },
  ),
);
