import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HamsterProfile, PresetMeal, SingleFood, CleaningOption } from '@/types';
import {
  DEFAULT_CLEANING_OPTIONS,
  DEFAULT_PRESET_MEALS,
  DEFAULT_SINGLE_FOODS,
} from '@/constants/defaults';

function moveItem<T extends { id: string }>(
  arr: T[],
  id: string,
  dir: 'up' | 'down',
): T[] {
  const idx = arr.findIndex((i) => i.id === id);
  if (idx === -1) return arr;
  if (dir === 'up' && idx === 0) return arr;
  if (dir === 'down' && idx === arr.length - 1) return arr;
  const next = [...arr];
  const swap = dir === 'up' ? idx - 1 : idx + 1;
  [next[idx], next[swap]] = [next[swap]!, next[idx]!];
  return next;
}

interface ProfileStore {
  profile: HamsterProfile | null;
  presetMeals: PresetMeal[];
  singleFoods: SingleFood[];
  cleaningOptions: CleaningOption[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setProfile: (profile: HamsterProfile) => void;
  updateProfile: (updates: Partial<HamsterProfile>) => void;
  // PresetMeal
  addPresetMeal: (meal: PresetMeal) => void;
  updatePresetMeal: (id: string, updates: Partial<Omit<PresetMeal, 'id'>>) => void;
  removePresetMeal: (id: string) => void;
  movePresetMeal: (id: string, dir: 'up' | 'down') => void;
  // SingleFood
  addSingleFood: (food: SingleFood) => void;
  updateSingleFood: (id: string, updates: Partial<Omit<SingleFood, 'id'>>) => void;
  removeSingleFood: (id: string) => void;
  moveSingleFood: (id: string, dir: 'up' | 'down') => void;
  // CleaningOption
  addCleaningOption: (option: CleaningOption) => void;
  updateCleaningOption: (id: string, updates: Partial<Omit<CleaningOption, 'id'>>) => void;
  removeCleaningOption: (id: string) => void;
  moveCleaningOption: (id: string, dir: 'up' | 'down') => void;
  setCleaningOptions: (options: CleaningOption[]) => void;
  setPresetMeals: (meals: PresetMeal[]) => void;
  setSingleFoods: (foods: SingleFood[]) => void;
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

      // PresetMeal
      addPresetMeal: (meal) =>
        set((state) => ({ presetMeals: [...state.presetMeals, meal] })),
      updatePresetMeal: (id, updates) =>
        set((state) => ({
          presetMeals: state.presetMeals.map((m) =>
            m.id === id ? { ...m, ...updates } : m,
          ),
        })),
      removePresetMeal: (id) =>
        set((state) => ({
          presetMeals: state.presetMeals.filter((m) => m.id !== id),
        })),
      movePresetMeal: (id, dir) =>
        set((state) => ({ presetMeals: moveItem(state.presetMeals, id, dir) })),

      // SingleFood
      addSingleFood: (food) =>
        set((state) => ({ singleFoods: [...state.singleFoods, food] })),
      updateSingleFood: (id, updates) =>
        set((state) => ({
          singleFoods: state.singleFoods.map((f) =>
            f.id === id ? { ...f, ...updates } : f,
          ),
        })),
      removeSingleFood: (id) =>
        set((state) => ({
          singleFoods: state.singleFoods.filter((f) => f.id !== id),
        })),
      moveSingleFood: (id, dir) =>
        set((state) => ({ singleFoods: moveItem(state.singleFoods, id, dir) })),

      // CleaningOption
      addCleaningOption: (option) =>
        set((state) => ({ cleaningOptions: [...state.cleaningOptions, option] })),
      updateCleaningOption: (id, updates) =>
        set((state) => ({
          cleaningOptions: state.cleaningOptions.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),
      removeCleaningOption: (id) =>
        set((state) => ({
          cleaningOptions: state.cleaningOptions.filter((c) => c.id !== id),
        })),
      moveCleaningOption: (id, dir) =>
        set((state) => ({
          cleaningOptions: moveItem(state.cleaningOptions, id, dir),
        })),
      setCleaningOptions: (options) => set({ cleaningOptions: options }),
      setPresetMeals: (meals) => set({ presetMeals: meals }),
      setSingleFoods: (foods) => set({ singleFoods: foods }),
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
