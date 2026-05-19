import { useCallback, useEffect, useState } from 'react';
import { getSpotById } from '../services/spotService';
import { EntityId, FishingSpot } from '../types/domain';

type SpotDetailState = {
  data: FishingSpot | null;
  loading: boolean;
  error: string | null;
};

export function useSpotDetail(spotId: EntityId) {
  const [state, setState] = useState<SpotDetailState>({ data: null, loading: true, error: null });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const spot = await getSpotById(spotId);
      setState({ data: spot, loading: false, error: spot ? null : 'Spot introuvable.' });
    } catch {
      setState({ data: null, loading: false, error: 'Impossible de charger le spot.' });
    }
  }, [spotId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}
