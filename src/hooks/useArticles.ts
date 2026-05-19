import { useCallback, useEffect, useMemo, useState } from 'react';
import { getArticles } from '../services/articleService';
import { Article, EntityId } from '../types/domain';

type ArticlesState = {
  data: Article[];
  loading: boolean;
  error: string | null;
};

export function useArticles(category = 'Tous') {
  const [state, setState] = useState<ArticlesState>({ data: [], loading: true, error: null });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const articles = await getArticles();
      setState({ data: articles, loading: false, error: null });
    } catch {
      setState({ data: [], loading: false, error: 'Impossible de charger les articles.' });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredArticles = useMemo(() => {
    if (category === 'Tous') {
      return state.data;
    }

    return state.data.filter((article) => article.category === category);
  }, [category, state.data]);

  const toggleSaved = useCallback((articleId: EntityId) => {
    setState((current) => ({
      ...current,
      data: current.data.map((article) =>
        article.id === articleId ? { ...article, saved: !article.saved } : article,
      ),
    }));
  }, []);

  return { ...state, filteredArticles, refresh, toggleSaved };
}
