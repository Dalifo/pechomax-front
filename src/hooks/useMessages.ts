import { useCallback, useEffect, useMemo, useState } from 'react';
import { getConversations } from '../services/messageService';
import { ConversationSummary } from '../types/domain';

type MessagesState = {
  data: ConversationSummary[];
  loading: boolean;
  error: string | null;
};

export function useMessages(query = '') {
  const [state, setState] = useState<MessagesState>({ data: [], loading: true, error: null });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const conversations = await getConversations();
      setState({ data: conversations, loading: false, error: null });
    } catch {
      setState({ data: [], loading: false, error: 'Impossible de charger les conversations.' });
    }
  }, []);

  const upsertConversation = useCallback((conversation: ConversationSummary) => {
    setState((current) => {
      const exists = current.data.some((item) => item.id === conversation.id);
      const data = exists
        ? current.data.map((item) => (item.id === conversation.id ? conversation : item))
        : [conversation, ...current.data];

      return { ...current, data };
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return state.data;
    }

    return state.data.filter((conversation) =>
      conversation.user.name.toLowerCase().includes(normalizedQuery),
    );
  }, [query, state.data]);

  return { ...state, filteredConversations, refresh, upsertConversation };
}
