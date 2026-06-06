import { useCallback, useState } from 'react';

export interface UseBooleanReturn {
  value: boolean;
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
  setValue: (next: boolean) => void;
}

export function useBoolean(initialValue = false): UseBooleanReturn {
  const [value, setValue] = useState<boolean>(initialValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((prev) => !prev), []);

  return { value, setTrue, setFalse, toggle, setValue };
}
