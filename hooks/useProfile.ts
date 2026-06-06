import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useProfileStore } from '@/store/profileStore';
import type { HamsterProfile } from '@/types';

const PROFILE_KEY = ['profile'] as const;

export function useProfile() {
  const _hasHydrated = useProfileStore((s) => s._hasHydrated);
  const profile = useProfileStore((s) => s.profile);

  const query = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => Promise.resolve(useProfileStore.getState().profile),
    enabled: _hasHydrated,
    staleTime: Infinity,
  });

  return {
    profile,
    isLoading: !_hasHydrated || query.isLoading,
    error: query.error,
  };
}

export function useSaveProfile() {
  const queryClient = useQueryClient();
  const setProfile = useProfileStore((s) => s.setProfile);
  const updateProfile = useProfileStore((s) => s.updateProfile);

  return useMutation({
    mutationFn: async (data: HamsterProfile) => {
      const existing = useProfileStore.getState().profile;
      if (existing) {
        updateProfile(data);
      } else {
        setProfile(data);
      }
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
    },
  });
}

export function usePresetMeals() {
  return useProfileStore((s) => s.presetMeals);
}

export function useSingleFoods() {
  return useProfileStore((s) => s.singleFoods);
}

export function useCleaningOptions() {
  return useProfileStore((s) => s.cleaningOptions);
}

export function useManagePresetMeals() {
  const add = useProfileStore((s) => s.addPresetMeal);
  const update = useProfileStore((s) => s.updatePresetMeal);
  const remove = useProfileStore((s) => s.removePresetMeal);
  const reorder = useProfileStore((s) => s.setPresetMeals);
  return { add, update, remove, reorder };
}

export function useManageSingleFoods() {
  const add = useProfileStore((s) => s.addSingleFood);
  const update = useProfileStore((s) => s.updateSingleFood);
  const remove = useProfileStore((s) => s.removeSingleFood);
  const reorder = useProfileStore((s) => s.setSingleFoods);
  return { add, update, remove, reorder };
}

export function useManageCleaningOptions() {
  const add = useProfileStore((s) => s.addCleaningOption);
  const update = useProfileStore((s) => s.updateCleaningOption);
  const remove = useProfileStore((s) => s.removeCleaningOption);
  const reorder = useProfileStore((s) => s.setCleaningOptions);
  return { add, update, remove, reorder };
}
