import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  async get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },

  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },

  async remove(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};

// Convenience helpers for auth tokens
export const tokenStorage = {
  async getAccessToken() {
    return secureStorage.get('access_token');
  },
  async setAccessToken(token: string) {
    return secureStorage.set('access_token', token);
  },
  async getRefreshToken() {
    return secureStorage.get('refresh_token');
  },
  async setRefreshToken(token: string) {
    return secureStorage.set('refresh_token', token);
  },
  async clear() {
    await Promise.all([
      secureStorage.remove('access_token'),
      secureStorage.remove('refresh_token'),
    ]);
  },
};
