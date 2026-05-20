import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { Input } from '../components/ui/Input';
import { RemoteImage } from '../components/ui/RemoteImage';
import { usePostDetail } from '../hooks/usePostDetail';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PostDetail'>;

export function PostDetailScreen({ navigation, route }: Props) {
  const { data: post, loading, submitComment, toggleLike, toggleSave } = usePostDetail(route.params.postId);
  const scrollRef = useRef<ScrollView>(null);
  const [comment, setComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  const sharePost = async () => {
    if (!post) {
      return;
    }

    await Share.share({
      message: `${post.author.name} a partage une prise PechoMax: ${post.fishName} (${post.weightLabel ?? 'poids non renseigne'}).`,
      title: 'Prise PechoMax',
    });
  };

  const sendComment = async () => {
    const content = comment.trim();
    if (!content) {
      return;
    }

    setCommenting(true);
    try {
      await submitComment(content);
      setComment('');
    } catch {
      Alert.alert('Commentaire non envoyé', 'Vérifiez votre connexion et réessayez.');
    } finally {
      setCommenting(false);
    }
  };

  if (loading || !post) {
    return (
      <Screen padded={false}>
        <AppHeader onBack={navigation.goBack} showBack title="Publication" />
        <EmptyState description="Chargement de la publication." icon="fish-outline" title="Chargement" />
      </Screen>
    );
  }

  return (
    <Screen padded={false} style={styles.root}>
      <AppHeader
        onBack={navigation.goBack}
        showBack
        title="Publication"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        style={styles.screenFill}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
        >
          <RemoteImage style={styles.photoBlock} uri={post.imageUrl}>
            <Ionicons name="fish-outline" size={72} color={colors.secondary} />
          </RemoteImage>

          <View style={styles.actionBar}>
            <View style={styles.actionGroup}>
              <Pressable accessibilityRole="button" onPress={toggleLike} style={styles.inlineAction}>
                <Ionicons name={post.liked ? 'heart' : 'heart-outline'} size={24} color={post.liked ? colors.earth : colors.textMuted} />
                <Text style={styles.actionText}>{post.likes}</Text>
              </Pressable>
              <View style={styles.inlineAction}>
                <Ionicons name="chatbubble-outline" size={23} color={colors.textMuted} />
                <Text style={styles.actionText}>{post.comments}</Text>
              </View>
              <IconButton accessibilityLabel="Partager" icon="share-outline" onPress={sharePost} size="sm" variant="plain" />
            </View>
            <IconButton
              accessibilityLabel="Enregistrer"
              icon={post.bookmarked ? 'bookmark' : 'bookmark-outline'}
              onPress={toggleSave}
              variant={post.bookmarked ? 'primary' : 'soft'}
            />
          </View>

          <View style={styles.content}>
            <Pressable
              accessibilityLabel={`Ouvrir le profil de ${post.author.name}`}
              accessibilityRole="button"
              onPress={() => navigation.navigate('UserProfile', { userId: post.author.id })}
              style={styles.authorRow}
            >
              <Avatar initials={post.author.initials} label={post.author.name} size="md" source={post.author.profilePic ? { uri: post.author.profilePic } : undefined} />
          <View style={styles.textFill}>
                <Text style={styles.author}>{post.author.name}</Text>
                <Text style={styles.muted}>Niveau {post.author.level ?? 1} - {post.detailDateLabel}</Text>
              </View>
            </Pressable>

            <View style={styles.factGrid}>
              <Card padding="md" style={styles.factCard}>
                <Ionicons name="fish-outline" size={22} color={colors.primary} />
                <Text style={styles.factText}>{post.fishName}</Text>
              </Card>
              <Card padding="md" style={styles.factCard}>
                <Ionicons name="scale-outline" size={22} color={colors.secondary} />
                <Text style={styles.factText}>{post.weightLabel}</Text>
              </Card>
              <Card
                onPress={() => post.spotId && navigation.navigate('SpotDetail', { spotId: post.spotId })}
                padding="md"
                style={styles.factCard}
              >
                <Ionicons name="location-outline" size={22} color={colors.earth} />
                <Text numberOfLines={1} style={styles.factText}>{post.spotName}</Text>
              </Card>
            </View>

            <Text style={styles.description}>{post.description}</Text>

            <Text style={styles.sectionHeading}>Commentaires ({post.comments})</Text>
            {post.commentsList.length > 0 ? post.commentsList.map((item) => (
              <CommentRow
                initials={item.author.initials}
                key={item.id}
                name={item.author.name}
                text={item.text}
                timeLabel={item.timeLabel}
              />
            )) : (
              <Text style={styles.muted}>Aucun commentaire pour le moment.</Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.commentBar}>
          <Input
            accessibilityLabel="Ajouter un commentaire"
            containerStyle={styles.commentInput}
            onChangeText={setComment}
            onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80)}
            placeholder="Ajouter un commentaire..."
            returnKeyType="send"
            onSubmitEditing={sendComment}
            value={comment}
          />
          <Button disabled={!comment.trim()} loading={commenting} onPress={sendComment} title="Envoyer" />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function CommentRow({ initials, name, text, timeLabel }: { initials: string; name: string; text: string; timeLabel: string }) {
  return (
    <View style={styles.commentRow}>
      <Avatar initials={initials} size="sm" />
      <View style={styles.commentBubble}>
        <Text style={styles.commentName}>{name}</Text>
        <Text style={styles.commentText}>{text}</Text>
        <Text style={styles.commentTime}>{timeLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
  },
  screenFill: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  photoBlock: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: opacity.secondary10,
    justifyContent: 'center',
    width: '100%',
  },
  actionBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: opacity.black08,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  actionGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.lg,
  },
  inlineAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionText: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
    fontWeight: typography.weights.bold,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  authorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  textFill: {
    flex: 1,
    minWidth: 0,
  },
  author: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.weights.bold,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  factGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  factCard: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    minHeight: 92,
  },
  factText: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  description: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 21,
  },
  sectionHeading: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 17,
    fontWeight: typography.weights.bold,
  },
  commentRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  commentBubble: {
    backgroundColor: opacity.black06,
    borderRadius: radius.lg,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  commentName: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  commentText: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  commentTime: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 11,
  },
  commentBar: {
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderTopColor: opacity.black08,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  commentInput: {
    flex: 1,
  },
});
