import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { RemoteImage } from '../components/ui/RemoteImage';
import { useMyPosts, usePosts } from '../hooks/usePosts';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { CatchPost } from '../types/domain';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
type FeedFilter = 'Tous' | 'Mes publications';

const filters: FeedFilter[] = ['Tous', 'Mes publications'];

function PostCard({
  onBookmark,
  onLike,
  onOpen,
  onOpenSpot,
  onOpenUser,
  onShare,
  post,
}: {
  onBookmark: () => void;
  onLike: () => void;
  onOpen: () => void;
  onOpenSpot: () => void;
  onOpenUser: () => void;
  onShare: () => void;
  post: CatchPost;
}) {
  return (
    <Card accessibilityLabel={`Ouvrir la publication de ${post.author.name}`} elevated onPress={onOpen} style={styles.postCard}>
      <View style={styles.postHeader}>
        <Pressable accessibilityLabel={`Ouvrir le profil de ${post.author.name}`} accessibilityRole="button" onPress={onOpenUser}>
          <Avatar initials={post.author.initials} label={post.author.name} size="md" source={post.author.profilePic ? { uri: post.author.profilePic } : undefined} />
        </Pressable>
        <View style={styles.fill}>
          <Text style={styles.author}>{post.author.name}</Text>
          <Pressable
            accessibilityLabel={`Ouvrir le spot ${post.spotName}`}
            accessibilityRole="button"
            onPress={onOpenSpot}
            style={styles.locationRow}
          >
            <Text style={styles.muted}>{post.createdAtLabel}</Text>
            <Text style={styles.muted}>-</Text>
            <Ionicons name="location-outline" size={11} color={colors.textMuted} />
            <Text numberOfLines={1} style={styles.muted}>{post.spotName}</Text>
          </Pressable>
        </View>
        {post.likes > 30 ? <Badge label="Populaire" tone="earth" /> : null}
      </View>

      <Text style={styles.contentText}>{post.content}</Text>

      {post.hasPhoto ? (
        <RemoteImage style={styles.photoPlaceholder} uri={post.imageUrl}>
          <Ionicons name="fish-outline" size={56} color={colors.secondary} />
        </RemoteImage>
      ) : null}

      <View style={styles.actionBar}>
        <Pressable accessibilityLabel="Aimer la publication" accessibilityRole="button" onPress={onLike} style={styles.actionButton}>
          <Ionicons name={post.liked ? 'heart' : 'heart-outline'} size={20} color={post.liked ? colors.earth : colors.textMuted} />
          <Text style={[styles.actionText, post.liked && styles.actionTextActive]}>{post.likes}</Text>
        </Pressable>
        <View style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={19} color={colors.textMuted} />
          <Text style={styles.actionText}>{post.comments}</Text>
        </View>
        <View style={styles.actionSpacer} />
        <Pressable accessibilityLabel="Partager la publication" accessibilityRole="button" onPress={onShare} style={styles.iconAction}>
          <Ionicons name="share-outline" size={19} color={colors.textMuted} />
        </Pressable>
        <Pressable accessibilityLabel="Enregistrer la publication" accessibilityRole="button" onPress={onBookmark} style={styles.iconAction}>
          <Ionicons name={post.bookmarked ? 'bookmark' : 'bookmark-outline'} size={19} color={post.bookmarked ? colors.primary : colors.textMuted} />
        </Pressable>
      </View>
    </Card>
  );
}

export function CommunityScreen() {
  const navigation = useNavigation<RootNavigation>();
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('Tous');
  const { data: posts, loading, toggleBookmark, toggleLike } = usePosts();
  const { data: myPosts, loading: myPostsLoading, refresh: refreshMyPosts } = useMyPosts();

  const sharePost = async (post: CatchPost) => {
    await Share.share({
      message: `${post.author.name} a partage une prise PechoMax: ${post.fishName} (${post.weightLabel ?? 'poids non renseigne'}).`,
      title: 'Prise PechoMax',
    });
  };

  const visiblePosts = activeFilter === 'Mes publications' ? myPosts : posts;
  const isLoading = activeFilter === 'Mes publications' ? myPostsLoading : loading;

  const handleLike = async (postId: string) => {
    await toggleLike(postId);
    if (activeFilter === 'Mes publications') {
      refreshMyPosts();
    }
  };

  const handleBookmark = async (postId: string) => {
    await toggleBookmark(postId);
    if (activeFilter === 'Mes publications') {
      refreshMyPosts();
    }
  };

  return (
    <Screen edges={['top', 'left', 'right']} padded={false} scroll>
      <AppHeader
        action={
          <IconButton
            accessibilityLabel="Créer une publication"
            icon="add"
            onPress={() => navigation.navigate('CreatePost')}
            variant="primary"
          />
        }
        subtitle={`${posts.length} prises partagees`}
        title="Communaute"
      />

      <View style={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {filters.map((filter) => {
              const active = filter === activeFilter;
              return (
                <Pressable
                  accessibilityLabel={`Filtre ${filter}`}
                  accessibilityRole="button"
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  style={({ pressed }) => [styles.filterChip, active && styles.filterChipActive, pressed && styles.pressed]}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{filter}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {isLoading ? <EmptyState description="Chargement du fil communaute." title="Chargement" /> : null}

        {!isLoading && visiblePosts.length === 0 ? (
          <EmptyState
            description={activeFilter === 'Mes publications' ? "Vous n'avez encore publié aucune prise." : 'Aucune publication pour le moment.'}
            icon="chatbubbles-outline"
            title="Rien a afficher"
          />
        ) : null}

        {!isLoading && visiblePosts.map((post) => (
          <PostCard
            key={post.id}
            onBookmark={() => handleBookmark(post.id)}
            onLike={() => handleLike(post.id)}
            onOpen={() => navigation.navigate('PostDetail', { postId: post.id })}
            onOpenSpot={() => post.spotId && navigation.navigate('SpotDetail', { spotId: post.spotId })}
            onOpenUser={() => navigation.navigate('UserProfile', { userId: post.author.id })}
            onShare={() => sharePost(post)}
            post={post}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  filterChip: {
    backgroundColor: opacity.black06,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  filterTextActive: {
    color: colors.background,
  },
  postCard: {
    gap: spacing.lg,
  },
  postHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  fill: {
    flex: 1,
    minWidth: 0,
  },
  author: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.weights.bold,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 2,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  contentText: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 21,
  },
  photoPlaceholder: {
    alignItems: 'center',
    backgroundColor: opacity.secondary10,
    borderRadius: radius.lg,
    height: 176,
    justifyContent: 'center',
  },
  actionBar: {
    alignItems: 'center',
    borderTopColor: opacity.black08,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconAction: {
    padding: spacing.xs,
  },
  actionSpacer: {
    flex: 1,
  },
  actionText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  actionTextActive: {
    color: colors.earth,
  },
  pressed: {
    opacity: 0.72,
  },
});
