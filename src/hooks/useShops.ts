import { useCallback, useEffect, useMemo, useState } from 'react';
import { getShops } from '../services/shopService';
import { Shop } from '../types/domain';

export function useShops(category = 'Tous') {
  const [state, setState] = useState<{ data: Shop[]; loading: boolean; error: string | null }>({
    data: [],
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const shops = await getShops();
      setState({ data: shops, loading: false, error: null });
    } catch {
      setState({ data: [], loading: false, error: 'Impossible de charger les magasins.' });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredShops = useMemo(() => {
    if (category === 'Tous') {
      return state.data;
    }

    return state.data.filter((shop) => shop.type.includes(category));
  }, [category, state.data]);

  return { ...state, filteredShops, refresh };
}
