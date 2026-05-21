import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { Input } from '../components/ui/Input';
import { useMessages } from '../hooks/useMessages';
import { RootStackParamList } from '../navigation/types';
import { createConversationWithUser, searchConversationUsers } from '../services/messageService';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { ConversationSummary, UserSummary } from '../types/domain';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

function ConversationRow({ conversation, onPress }: { conversation: ConversationSummary; onPress: () => void }) {
  const hasUnread = conversation.unreadCount > 0;

  return (
    <Pressable
      accessibilityLabel={`Ouvrir la conversation avec ${conversation.user.name}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.avatarWrap}>
        <Avatar initials={conversation.user.initials} label={conversation.user.name} size="lg" source={conversation.user.profilePic ? { uri: conversation.user.profilePic } : undefined} />
        {conversation.online ? <View style={styles.onlineDot} /> : null}
      </View>

      <View style={styles.textCol}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.name}>{conversation.user.name}</Text>
          <Text style={styles.time}>{conversation.timeLabel}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text numberOfLines={1} style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}>
            {conversation.lastMessage}
          </Text>
          {hasUnread ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export function ConversationsListScreen() {
  const navigation = useNavigation<RootNavigation>();
  const [query, setQuery] = useState('');
  const [starterVisible, setStarterVisible] = useState(false);
  const [recipientQuery, setRecipientQuery] = useState('');
  const [recipients, setRecipients] = useState<UserSummary[]>([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [starterError, setStarterError] = useState<string | null>(null);
  const [creatingRecipientId, setCreatingRecipientId] = useState<string | null>(null);
  const { data: conversations, filteredConversations, loading, refresh, upsertConversation } = useMessages(query);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const filteredRecipients = useMemo(() => {
    const normalizedQuery = recipientQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return recipients;
    }

    return recipients.filter((user) =>
      [user.name, user.location]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedQuery)),
    );
  }, [recipientQuery, recipients]);

  const loadRecipients = useCallback(async (nextQuery = '') => {
    setRecipientsLoading(true);
    setStarterError(null);

    try {
      const users = await searchConversationUsers(nextQuery);
      setRecipients(users);
    } catch {
      setRecipients([]);
      setStarterError('Impossible de charger les pêcheurs.');
    } finally {
      setRecipientsLoading(false);
    }
  }, []);

  const openStarter = () => {
    setRecipientQuery('');
    setStarterVisible(true);
    void loadRecipients();
  };

  const closeStarter = () => {
    if (creatingRecipientId) {
      return;
    }

    setStarterVisible(false);
    setStarterError(null);
  };

  const startConversation = async (recipient: UserSummary) => {
    const existingConversation = conversations.find((conversation) => conversation.user.id === recipient.id);

    if (existingConversation) {
      setStarterVisible(false);
      navigation.navigate('Conversation', { conversationId: existingConversation.id, recipient });
      return;
    }

    setCreatingRecipientId(recipient.id);
    setStarterError(null);

    try {
      const conversation = await createConversationWithUser(recipient);
      upsertConversation(conversation);
      setStarterVisible(false);
      navigation.navigate('Conversation', { conversationId: conversation.id, recipient });
    } catch {
      setStarterError('Impossible de créer la conversation.');
    } finally {
      setCreatingRecipientId(null);
    }
  };

  return (
    <Screen edges={['top', 'left', 'right']} padded={false} scroll>
      <AppHeader
        action={<IconButton accessibilityLabel="Nouvelle conversation" icon="create-outline" onPress={openStarter} variant="soft" />}
        subtitle="Conversations pêche et sorties"
        title="Messages"
      />

      <View style={styles.content}>
        <Input
          accessibilityLabel="Rechercher une conversation"
          iconLeft="search-outline"
          onChangeText={setQuery}
          placeholder="Rechercher une conversation..."
          value={query}
        />

        {loading ? <EmptyState description="Chargement des messages." icon="chatbubbles-outline" title="Chargement" /> : null}

        {!loading && filteredConversations.length === 0 ? (
          <EmptyState
            description={query.trim() ? 'Aucune conversation ne correspond a cette recherche.' : 'Aucune conversation pour le moment.'}
            icon={query.trim() ? 'search-outline' : 'chatbubble-outline'}
            title="Aucune conversation"
          />
        ) : null}

        {!loading && filteredConversations.map((conversation) => (
          <ConversationRow
            conversation={conversation}
            key={conversation.id}
            onPress={() => navigation.navigate('Conversation', { conversationId: conversation.id, recipient: conversation.user })}
          />
        ))}
      </View>

      <Modal animationType="slide" onRequestClose={closeStarter} transparent visible={starterVisible}>
        <Pressable onPress={closeStarter} style={styles.modalOverlay}>
          <Pressable style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleBlock}>
                <Text style={styles.modalTitle}>Nouvelle conversation</Text>
                <Text style={styles.modalSubtitle}>Recherchez un pêcheur pour démarrer l'échange.</Text>
              </View>
              <IconButton accessibilityLabel="Fermer" icon="close" onPress={closeStarter} size="sm" variant="soft" />
            </View>

            <Input
              accessibilityLabel="Rechercher une personne"
              iconLeft="search-outline"
              onChangeText={(value) => {
                setRecipientQuery(value);
                void loadRecipients(value);
              }}
              placeholder="Nom, ville ou email..."
              value={recipientQuery}
            />

            {starterError ? <Text style={styles.errorText}>{starterError}</Text> : null}
            {recipientsLoading ? <EmptyState description="Chargement des pêcheurs." icon="people-outline" title="Recherche" /> : null}

            {!recipientsLoading && filteredRecipients.length === 0 ? (
              <EmptyState
                description={recipientQuery.trim() ? 'Aucun pêcheur ne correspond à cette recherche.' : 'Aucun pêcheur disponible.'}
                icon="search-outline"
                title="Aucun résultat"
              />
            ) : null}

            {!recipientsLoading && filteredRecipients.length > 0 ? (
              <ScrollView contentContainerStyle={styles.recipientList} showsVerticalScrollIndicator={false}>
                {filteredRecipients.map((recipient) => {
                  const hasExistingConversation = conversations.some((conversation) => conversation.user.id === recipient.id);

                  return (
                    <View key={recipient.id} style={styles.recipientRow}>
                      <Avatar initials={recipient.initials} label={recipient.name} size="md" source={recipient.profilePic ? { uri: recipient.profilePic } : undefined} />
                      <View style={styles.recipientText}>
                        <Text numberOfLines={1} style={styles.recipientName}>{recipient.name}</Text>
                        {recipient.location ? <Text numberOfLines={1} style={styles.recipientMeta}>{recipient.location}</Text> : null}
                      </View>
                      <Button
                        loading={creatingRecipientId === recipient.id}
                        onPress={() => startConversation(recipient)}
                        size="sm"
                        title={hasExistingConversation ? 'Ouvrir' : 'Créer'}
                      />
                    </View>
                  );
                })}
              </ScrollView>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.xxl,
  },
  modalOverlay: {
    backgroundColor: opacity.black56,
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    gap: spacing.md,
    maxHeight: '82%',
    padding: spacing.xxl,
  },
  modalHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  modalTitleBlock: {
    flex: 1,
  },
  modalTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 19,
    fontWeight: typography.weights.bold,
  },
  modalSubtitle: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  errorText: {
    color: colors.danger,
    fontFamily: typography.fontFamily,
    fontSize: 13,
  },
  recipientList: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  recipientRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: opacity.black08,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  recipientText: {
    flex: 1,
    minWidth: 0,
  },
  recipientName: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
    fontWeight: typography.weights.bold,
  },
  recipientMeta: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: opacity.black08,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 82,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.72,
  },
  avatarWrap: {
    position: 'relative',
  },
  onlineDot: {
    backgroundColor: colors.primary,
    borderColor: colors.background,
    borderRadius: radius.round,
    borderWidth: 3,
    bottom: 0,
    height: 17,
    position: 'absolute',
    right: 0,
    width: 17,
  },
  textCol: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  name: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.weights.bold,
  },
  time: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  messageRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  lastMessage: {
    color: colors.textMuted,
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 13,
  },
  lastMessageUnread: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.weights.bold,
  },
  unreadBadge: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    height: 24,
    justifyContent: 'center',
    minWidth: 24,
    paddingHorizontal: spacing.xs,
  },
  unreadText: {
    color: colors.background,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
});
