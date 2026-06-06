import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    const raw = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, raw);
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },

  async keys(): Promise<readonly string[]> {
    return AsyncStorage.getAllKeys();
  },
};
