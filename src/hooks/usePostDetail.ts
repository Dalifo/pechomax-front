import { useCallback, useEffect, useState } from 'react';
import { getPostById } from '../services/postService';
import { CatchPostDetail, EntityId } from '../types/domain';

type PostDetailState = {
  data: CatchPostDetail | null;
  loading: boolean;
  error: string | null;
};

export function usePostDetail(postId: EntityId) {
  const [state, setState] = useState<PostDetailState>({ data: null, loading: true, error: null });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const post = await getPostById(postId);
      setState({ data: post, loading: false, error: post ? null : 'Publication introuvable.' });
    } catch {
      setState({ data: null, loading: false, error: 'Impossible de charger la publication.' });
    }
  }, [postId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}
