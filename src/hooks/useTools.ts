import { useCallback, useEffect, useState } from 'react';
import { getTools } from '../services/toolService';
import { FishingTool } from '../types/domain';

export function useTools() {
  const [state, setState] = useState<{ data: FishingTool[]; loading: boolean; error: string | null }>({
    data: [],
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const tools = await getTools();
      setState({ data: tools, loading: false, error: null });
    } catch {
      setState({ data: [], loading: false, error: 'Impossible de charger les outils.' });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}
