import { useCallback, useEffect, useState } from 'react';
import { storage } from '@/lib/storage';

export function useAsyncStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storage.get<T>(key).then((stored) => {
      if (stored !== null) setValue(stored);
      setIsLoading(false);
    });
  }, [key]);

  const save = useCallback(
    async (next: T) => {
      setValue(next);
      await storage.set(key, next);
    },
    [key]
  );

  const remove = useCallback(async () => {
    setValue(initialValue);
    await storage.remove(key);
  }, [key, initialValue]);

  return { value, save, remove, isLoading } as const;
}
