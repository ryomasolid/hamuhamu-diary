import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HamsterProfile, PresetMeal, SingleFood, CleaningOption } from '@/types';
import {
  DEFAULT_CLEANING_OPTIONS,
  DEFAULT_PRESET_MEALS,
  DEFAULT_SINGLE_FOODS,
} from '@/constants/defaults';

interface ProfileStore {
  profile: HamsterProfile | null;
  presetMeals: PresetMeal[];
  singleFoods: SingleFood[];
  cleaningOptions: CleaningOption[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setProfile: (profile: HamsterProfile) => void;
  updateProfile: (updates: Partial<HamsterProfile>) => void;
  addPresetMeal: (meal: PresetMeal) => void;
  removePresetMeal: (id: string) => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: null,
      presetMeals: DEFAULT_PRESET_MEALS,
      singleFoods: DEFAULT_SINGLE_FOODS,
      cleaningOptions: DEFAULT_CLEANING_OPTIONS,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setProfile: (profile) => set({ profile }),

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),

      addPresetMeal: (meal) =>
        set((state) => ({ presetMeals: [...state.presetMeals, meal] })),

      removePresetMeal: (id) =>
        set((state) => ({
          presetMeals: state.presetMeals.filter((m) => m.id !== id),
        })),
    }),
    {
      name: 'hamu-profile',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
