import { ConversationSummary, EntityId, Message, UserSummary } from '../types/domain';
import { mapConversation, mapMessage } from './apiMappers';
import { BackendCategory, BackendConversation, BackendMessage, BackendUser } from './backendTypes';
import { getCurrentUserId } from './authService';
import { ApiError, httpClient } from './httpClient';

const recipientOverrides = new Map<EntityId, UserSummary>();

function withRecipientOverride(conversation: ConversationSummary) {
  const recipient = recipientOverrides.get(conversation.id);
  return recipient ? { ...conversation, user: recipient } : conversation;
}

export async function getConversations(): Promise<ConversationSummary[]> {
  const conversations = await httpClient.get<BackendConversation[]>('/conversations/self');
  const currentUserId = getCurrentUserId();
  return conversations.map((conversation) => mapConversation(conversation, currentUserId)).map(withRecipientOverride);
}

export async function getConversationMessages(conversationId: EntityId): Promise<Message[]> {
  try {
    const messages = await httpClient.get<BackendMessage[]>(`/conversations/${conversationId}/messages`);
    const currentUserId = getCurrentUserId();
    return messages.map((message) => mapMessage(message, currentUserId)).reverse();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }

    throw error;
  }
}

export async function getConversationById(conversationId: EntityId): Promise<ConversationSummary | null> {
  try {
    const conversation = await httpClient.get<BackendConversation>(`/conversations/${conversationId}`);
    return withRecipientOverride(mapConversation(conversation, getCurrentUserId()));
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

export async function searchConversationUsers(query: string): Promise<UserSummary[]> {
  const normalizedQuery = query.trim().toLowerCase();
  const currentUserId = getCurrentUserId();
  const users = await httpClient.get<BackendUser[]>('/users/all');

  return users
    .filter((user) => user.id !== currentUserId)
    .filter((user) => {
      if (!normalizedQuery) {
        return true;
      }

      return [user.username, user.city, user.region, user.email]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedQuery));
    })
    .map((user) => ({
      id: user.id,
      initials: user.username
        .split(/[\s._-]+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'PM',
      level: user.level?.value ?? undefined,
      location: [user.city, user.region].filter(Boolean).join(', ') || undefined,
      name: user.username,
      profilePic: user.profile_pic ?? undefined,
    }))
    .slice(0, 20);
}

async function getDefaultConversationCategoryId() {
  const categories = await httpClient.get<BackendCategory[]>('/categories');
  const preferred = categories.find((category) => category.name.toLowerCase() === 'général')
    ?? categories.find((category) => category.name.toLowerCase() === 'general')
    ?? categories[0];

  if (!preferred) {
    throw new Error('No conversation category available');
  }

  return preferred.id;
}

export async function createConversationWithUser(user: UserSummary): Promise<ConversationSummary> {
  const categoryId = await getDefaultConversationCategoryId();
  const conversation = await httpClient.post<BackendConversation>('/conversations/create', {
    categoryId,
    recipientId: user.id,
    title: `Conversation avec ${user.name}`,
  });

  recipientOverrides.set(conversation.id, user);

  return {
    id: conversation.id,
    lastMessage: 'Nouvelle conversation',
    online: false,
    timeLabel: "A l'instant",
    unreadCount: 0,
    user,
  };
}
