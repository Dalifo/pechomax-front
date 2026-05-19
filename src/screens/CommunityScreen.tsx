import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { usePosts } from '../hooks/usePosts';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { CatchPost } from '../types/domain';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
type FeedFilter = 'Tous' | 'Amis' | 'Tendances' | 'Mes spots';

const filters: FeedFilter[] = ['Tous', 'Amis', 'Tendances', 'Mes spots'];

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
          <Avatar initials={post.author.initials} label={post.author.name} size="md" />
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
        <View style={styles.photoPlaceholder}>
          <Ionicons name="fish-outline" size={56} color={colors.secondary} />
        </View>
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
  const { data: posts, loading } = usePosts();

  const showUnavailable = () => {
    Alert.alert('Fonction a venir', 'Cette action sera disponible prochainement.');
  };

  const visiblePosts = posts.filter((post) => {
    if (activeFilter === 'Tendances') {
      return post.likes >= 30;
    }

    if (activeFilter === 'Mes spots') {
      return post.bookmarked;
    }

    return true;
  });

  return (
    <Screen padded={false} scroll>
      <AppHeader
        action={
          <IconButton
            accessibilityLabel="Creer une publication"
            icon="add"
            onPress={() => navigation.navigate('CreatePost')}
            variant="primary"
          />
        }
        subtitle="+127 nouvelles prises aujourd'hui"
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

        {loading ? <EmptyState description="Chargement du fil communaute." title="Chargement" /> : null}

        {!loading && visiblePosts.length === 0 ? (
          <EmptyState description="Aucune publication pour ce filtre." icon="chatbubbles-outline" title="Rien a afficher" />
        ) : null}

        {!loading && visiblePosts.map((post) => (
          <PostCard
            key={post.id}
            onBookmark={showUnavailable}
            onLike={showUnavailable}
            onOpen={() => navigation.navigate('PostDetail', { postId: post.id })}
            onOpenSpot={() => post.spotId && navigation.navigate('SpotDetail', { spotId: post.spotId })}
            onOpenUser={() => navigation.navigate('UserProfile', { userId: post.author.id })}
            onShare={showUnavailable}
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
