import { useCallback, useEffect, useState } from 'react';
import { getProfile, updateProfile, UpdateProfileInput } from '../services/profileService';
import { UserProfile } from '../types/profile';

type ProfileState = {
  data: UserProfile | null;
  loading: boolean;
  error: string | null;
};

export function useProfile() {
  const [state, setState] = useState<ProfileState>({
    data: null,
    loading: true,
    error: null,
  });

  const loadProfile = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const profile = await getProfile();
      setState({ data: profile, loading: false, error: null });
    } catch {
      setState({ data: null, loading: false, error: 'Impossible de charger le profil.' });
    }
  }, []);

  const saveProfile = useCallback(async (input: UpdateProfileInput) => {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const profile = await updateProfile(input);
      setState({ data: profile, loading: false, error: null });
      return profile;
    } catch {
      setState((current) => ({ ...current, loading: false, error: 'Impossible de sauvegarder le profil.' }));
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    getProfile()
      .then((profile) => {
        if (active) {
          setState({ data: profile, loading: false, error: null });
        }
      })
      .catch(() => {
        if (active) {
          setState({ data: null, loading: false, error: 'Impossible de charger le profil.' });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    ...state,
    refresh: loadProfile,
    saveProfile,
  };
}
