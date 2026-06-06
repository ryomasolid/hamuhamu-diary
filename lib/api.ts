import axios from 'axios';
import { tokenStorage } from './secureStorage';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'https://api.example.com',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await tokenStorage.clear();
    }
    return Promise.reject(error);
  }
);
