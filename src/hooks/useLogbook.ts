import { useCallback, useEffect, useMemo, useState } from 'react';
import { getLogbook } from '../services/logbookService';
import { LogbookCatch } from '../types/domain';

export function useLogbook(species = 'Tous') {
  const [state, setState] = useState<{ data: LogbookCatch[]; loading: boolean; error: string | null }>({
    data: [],
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const catches = await getLogbook();
      setState({ data: catches, loading: false, error: null });
    } catch {
      setState({ data: [], loading: false, error: 'Impossible de charger le journal.' });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredCatches = useMemo(() => {
    if (species === 'Tous') {
      return state.data;
    }

    return state.data.filter((catchItem) => catchItem.species === species);
  }, [species, state.data]);

  const stats = useMemo(() => {
    const total = state.data.length;
    const biggest = [...state.data].sort((a, b) => b.weight - a.weight)[0] ?? null;
    const averageWeight = total
      ? state.data.reduce((sum, catchItem) => sum + catchItem.weight, 0) / total
      : 0;

    return { averageWeight, biggest, total };
  }, [state.data]);

  return { ...state, filteredCatches, refresh, stats };
}
