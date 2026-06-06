import { useEffect } from 'react';
import { useTaskStore } from '@/store/taskStore';

export function useTasks() {
  const taskState = useTaskStore((s) => s.taskState);
  const _hasHydrated = useTaskStore((s) => s._hasHydrated);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const ensureTasksForToday = useTaskStore((s) => s.ensureTasksForToday);

  useEffect(() => {
    if (_hasHydrated) {
      ensureTasksForToday();
    }
  }, [_hasHydrated, ensureTasksForToday]);

  const completedCount = taskState.tasks.filter((t) => t.completed).length;
  const totalCount = taskState.tasks.length;
  const allCompleted = completedCount === totalCount;

  return {
    tasks: taskState.tasks,
    completedCount,
    totalCount,
    allCompleted,
    isLoading: !_hasHydrated,
    toggleTask,
  };
}
