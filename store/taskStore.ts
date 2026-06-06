import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import type { DailyTask } from '@/types';
import { DEFAULT_DAILY_TASKS } from '@/constants/defaults';

interface TaskState {
  date: string;
  tasks: DailyTask[];
}

interface TaskStore {
  taskState: TaskState;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  toggleTask: (id: string) => void;
  ensureTasksForToday: () => void;
}

function createDefaultTasks(): DailyTask[] {
  return DEFAULT_DAILY_TASKS.map((t) => ({ ...t, completed: false }));
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      taskState: {
        date: format(new Date(), 'yyyy-MM-dd'),
        tasks: createDefaultTasks(),
      },
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      toggleTask: (id) =>
        set((state) => ({
          taskState: {
            ...state.taskState,
            tasks: state.taskState.tasks.map((t) =>
              t.id === id ? { ...t, completed: !t.completed } : t,
            ),
          },
        })),

      ensureTasksForToday: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const { taskState } = get();
        if (taskState.date !== today) {
          set({
            taskState: { date: today, tasks: createDefaultTasks() },
          });
        }
      },
    }),
    {
      name: 'hamu-tasks',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
