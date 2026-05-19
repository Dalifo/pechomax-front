import { ConversationSummary, EntityId, Message } from '../types/domain';
import { mapConversation, mapMessage } from './apiMappers';
import { BackendConversation, BackendMessage } from './backendTypes';
import { getCurrentUserId } from './authService';
import { httpClient } from './httpClient';

export async function getConversations(): Promise<ConversationSummary[]> {
  const conversations = await httpClient.get<BackendConversation[]>('/conversations/self');
  return conversations.map(mapConversation);
}

export async function getConversationMessages(conversationId: EntityId): Promise<Message[]> {
  const messages = await httpClient.get<BackendMessage[]>(`/conversations/${conversationId}/messages`);
  const currentUserId = getCurrentUserId();
  return messages.map((message) => mapMessage(message, currentUserId)).reverse();
}

export async function getConversationById(conversationId: EntityId): Promise<ConversationSummary | null> {
  try {
    const conversation = await httpClient.get<BackendConversation>(`/conversations/${conversationId}`);
    return mapConversation(conversation);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return null;
    }

    throw error;
  }
}

export async function sendMessage(conversationId: EntityId, text: string): Promise<Message> {
  const body = new FormData();
  body.append('conversationId', conversationId);
  body.append('content', text);

  const message = await httpClient.post<BackendMessage>('/messages/create', body);
  return mapMessage(message, getCurrentUserId());
}

