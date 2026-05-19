import { useCallback, useEffect, useState } from 'react';
import { getConversationById, getConversationMessages, sendMessage } from '../services/messageService';
import { ConversationSummary, EntityId, Message } from '../types/domain';

type ConversationState = {
  conversation: ConversationSummary | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
};

export function useConversation(conversationId: EntityId) {
  const [state, setState] = useState<ConversationState>({
    conversation: null,
    messages: [],
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const [conversation, messages] = await Promise.all([
        getConversationById(conversationId),
        getConversationMessages(conversationId),
      ]);
      setState({ conversation, messages, loading: false, error: conversation ? null : 'Conversation introuvable.' });
    } catch {
      setState({ conversation: null, messages: [], loading: false, error: 'Impossible de charger la conversation.' });
    }
  }, [conversationId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const send = useCallback(async (text: string) => {
    const message = await sendMessage(conversationId, text);
    setState((current) => ({ ...current, messages: [...current.messages, message] }));
    return message;
  }, [conversationId]);

  return { ...state, refresh, send };
}
