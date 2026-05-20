import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { useMessages } from '../hooks/useMessages';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { ConversationSummary } from '../types/domain';

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
  const { filteredConversations, loading } = useMessages(query);

  return (
    <Screen padded={false} scroll>
      <AppHeader
        action={<Ionicons name="chatbubbles-outline" size={24} color={colors.primary} />}
        subtitle="Conversations peche et sorties"
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
          <EmptyState description="Aucune conversation ne correspond a cette recherche." icon="search-outline" title="Aucune conversation" />
        ) : null}

        {!loading && filteredConversations.map((conversation) => (
          <ConversationRow
            conversation={conversation}
            key={conversation.id}
            onPress={() => navigation.navigate('Conversation', { conversationId: conversation.id })}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.xxl,
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
