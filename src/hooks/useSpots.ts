import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSpots } from '../services/spotService';
import { FishingSpot, WaterType } from '../types/domain';

type SpotFilter = 'all' | WaterType | 'favorites';

type SpotsState = {
  data: FishingSpot[];
  loading: boolean;
  error: string | null;
};

export function useSpots(filter: SpotFilter = 'all', query = '') {
  const [state, setState] = useState<SpotsState>({ data: [], loading: true, error: null });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const spots = await getSpots();
      setState({ data: spots, loading: false, error: null });
    } catch {
      setState({ data: [], loading: false, error: 'Impossible de charger les spots.' });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredSpots = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return state.data.filter((spot) => {
      const matchesFilter = filter === 'all' || filter === 'favorites' || spot.waterType === filter;
      const matchesQuery =
        !normalizedQuery ||
        spot.name.toLowerCase().includes(normalizedQuery) ||
        spot.location.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, query, state.data]);

  return { ...state, filteredSpots, refresh };
}
