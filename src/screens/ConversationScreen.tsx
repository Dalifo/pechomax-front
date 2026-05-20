import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { Input } from '../components/ui/Input';
import { useConversation } from '../hooks/useConversation';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { Message } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'Conversation'>;

export function ConversationScreen({ navigation, route }: Props) {
  const { conversation, loading, messages, send } = useConversation(route.params.conversationId);
  const [draft, setDraft] = useState('');

  const showUnavailable = () => {
    Alert.alert('Fonction bientot disponible', 'Cette action sera ajoutee apres la demo.');
  };

  const submit = async () => {
    const text = draft.trim();
    if (!text) {
      return;
    }

    try {
      setDraft('');
      await send(text);
    } catch {
      setDraft(text);
      Alert.alert('Envoi impossible', 'Veuillez reessayer.');
    }
  };

  if (loading || !conversation) {
    return (
      <Screen padded={false}>
        <AppHeader onBack={navigation.goBack} showBack title="Conversation" />
        <EmptyState description="Chargement de la conversation." icon="chatbubble-outline" title="Chargement" />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <AppHeader
        action={<IconButton accessibilityLabel="Options" icon="ellipsis-vertical" onPress={showUnavailable} variant="soft" />}
        onBack={navigation.goBack}
        showBack
        subtitle={conversation.online ? 'En ligne' : 'Hors ligne'}
        title={conversation.user.name}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
        <ScrollView contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>
          <View style={styles.datePill}>
            <Text style={styles.dateText}>Aujourd'hui</Text>
          </View>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </ScrollView>
        <View style={styles.inputBar}>
          <IconButton accessibilityLabel="Ajouter une image" icon="image-outline" onPress={showUnavailable} variant="soft" />
          <Input
            accessibilityLabel="Envoyer un message"
            containerStyle={styles.input}
            onChangeText={setDraft}
            placeholder="Envoyer un message..."
            value={draft}
          />
          <IconButton accessibilityLabel="Envoyer" disabled={!draft.trim()} icon="send" onPress={submit} variant="primary" />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const mine = message.sender === 'me';

  return (
    <View style={[styles.messageRow, mine && styles.messageRowMine]}>
      {!mine ? <Avatar initials="SB" size="sm" /> : null}
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleThem]}>
        <Text style={[styles.messageText, mine && styles.messageTextMine]}>{message.text}</Text>
        <Text style={[styles.messageTime, mine && styles.messageTimeMine]}>{message.timeLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  messages: {
    gap: spacing.md,
    padding: spacing.xxl,
  },
  datePill: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderColor: opacity.black08,
    borderRadius: radius.round,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  dateText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  messageRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    borderRadius: radius.lg,
    maxWidth: '76%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
  },
  bubbleThem: {
    backgroundColor: colors.surface,
    borderColor: opacity.black08,
    borderWidth: StyleSheet.hairlineWidth,
  },
  messageText: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextMine: {
    color: colors.background,
  },
  messageTime: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 10,
    marginTop: spacing.xs,
  },
  messageTimeMine: {
    color: opacity.surface88,
  },
  inputBar: {
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderTopColor: opacity.black08,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  input: {
    flex: 1,
  },
});
