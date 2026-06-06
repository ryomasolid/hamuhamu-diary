import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRecordStore } from '@/store/recordStore';
import type { DailyRecord } from '@/types';

const RECORDS_KEY = ['records'] as const;

export function useRecords() {
  const _hasHydrated = useRecordStore((s) => s._hasHydrated);
  const records = useRecordStore((s) => s.records);

  const query = useQuery({
    queryKey: RECORDS_KEY,
    queryFn: () => Promise.resolve(useRecordStore.getState().records),
    enabled: _hasHydrated,
    staleTime: Infinity,
  });

  return {
    records,
    isLoading: !_hasHydrated || query.isLoading,
    error: query.error,
  };
}

export function useLatestRecord() {
  const _hasHydrated = useRecordStore((s) => s._hasHydrated);
  const getLatestRecord = useRecordStore((s) => s.getLatestRecord);

  const query = useQuery({
    queryKey: [...RECORDS_KEY, 'latest'],
    queryFn: () => Promise.resolve(getLatestRecord()),
    enabled: _hasHydrated,
    staleTime: Infinity,
  });

  return {
    record: query.data ?? null,
    isLoading: !_hasHydrated || query.isLoading,
  };
}

export function useAddRecord() {
  const queryClient = useQueryClient();
  const addRecord = useRecordStore((s) => s.addRecord);

  return useMutation({
    mutationFn: async (record: DailyRecord) => {
      addRecord(record);
      return record;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RECORDS_KEY });
    },
  });
}

export function useUpdateRecord() {
  const queryClient = useQueryClient();
  const updateRecord = useRecordStore((s) => s.updateRecord);

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<DailyRecord, 'id' | 'createdAt'>>;
    }) => {
      updateRecord(id, updates);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RECORDS_KEY });
    },
  });
}

export function useDeleteRecord() {
  const queryClient = useQueryClient();
  const deleteRecord = useRecordStore((s) => s.deleteRecord);

  return useMutation({
    mutationFn: async (id: string) => {
      deleteRecord(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RECORDS_KEY });
    },
  });
}
