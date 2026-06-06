import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
