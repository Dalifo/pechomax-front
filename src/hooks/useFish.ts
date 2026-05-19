import { useCallback, useEffect, useMemo, useState } from 'react';
import { getFishById, getFishSpecies } from '../services/fishService';
import { EntityId, FishSpecies, WaterType } from '../types/domain';

type FishFilter = 'all' | WaterType;

type FishState = {
  data: FishSpecies[];
  loading: boolean;
  error: string | null;
};

export function useFish(filter: FishFilter = 'all', query = '') {
  const [state, setState] = useState<FishState>({ data: [], loading: true, error: null });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const fish = await getFishSpecies();
      setState({ data: fish, loading: false, error: null });
    } catch {
      setState({ data: [], loading: false, error: 'Impossible de charger les poissons.' });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredFish = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return state.data.filter((fish) => {
      const matchesFilter = filter === 'all' || fish.type === filter;
      const matchesQuery =
        !normalizedQuery ||
        fish.name.toLowerCase().includes(normalizedQuery) ||
        fish.scientificName.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, state.data]);

  return { ...state, filteredFish, refresh };
}

export function useFishDetail(fishId: EntityId) {
  const [state, setState] = useState<{ data: FishSpecies | null; loading: boolean; error: string | null }>({
    data: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const fish = await getFishById(fishId);
      setState({ data: fish, loading: false, error: fish ? null : 'Poisson introuvable.' });
    } catch {
      setState({ data: null, loading: false, error: 'Impossible de charger le poisson.' });
    }
  }, [fishId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}
