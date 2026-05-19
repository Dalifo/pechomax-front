import { useCallback, useEffect, useState } from 'react';
import { getUserProfile } from '../services/profileService';
import { EntityId } from '../types/domain';
import { UserProfile } from '../types/profile';

type UserProfileState = {
  data: UserProfile | null;
  loading: boolean;
  error: string | null;
};

export function useUserProfile(userId: EntityId) {
  const [state, setState] = useState<UserProfileState>({ data: null, loading: true, error: null });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const profile = await getUserProfile(userId);
      setState({ data: profile, loading: false, error: null });
    } catch {
      setState({ data: null, loading: false, error: 'Impossible de charger ce profil.' });
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}
