import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { RemoteImage } from '../components/ui/RemoteImage';
import { SectionTitle } from '../components/ui/SectionTitle';
import { usePosts } from '../hooks/usePosts';
import { useProfile } from '../hooks/useProfile';
import { useSpots } from '../hooks/useSpots';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { CatchPost, FishingSpot } from '../types/domain';
import { IconName } from '../types/profile';
import { RootStackParamList } from '../navigation/types';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

const challengeProgress = 0.6;

function StatTile({ icon, label, value, tone }: { icon: IconName; label: string; value: string; tone: 'primary' | 'secondary' | 'earth' }) {
  const backgroundColor = tone === 'primary' ? colors.primary : tone === 'secondary' ? colors.secondary : colors.earth;

  return (
    <Card padding="md" style={[styles.statTile, { backgroundColor }]}>
      <Ionicons name={icon} size={20} color={colors.background} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

function RecentPostCard({ onPress, post }: { onPress: () => void; post: CatchPost }) {
  return (
    <Card accessibilityLabel={`Ouvrir la publication ${post.fishName}`} onPress={onPress} style={styles.postCard}>
      <View style={styles.postHeader}>
        <Avatar initials={post.author.initials} label={post.author.name} size="sm" source={post.author.profilePic ? { uri: post.author.profilePic } : undefined} />
        <View style={styles.fill}>
          <Text style={styles.author}>{post.author.name}</Text>
          <Text style={styles.muted}>{post.createdAtLabel}</Text>
        </View>
        {post.likes > 30 ? <Badge label="Tendance" tone="earth" /> : null}
      </View>
      <Text style={styles.postTitle}>{post.fishName}</Text>
      {post.imageUrl ? (
        <RemoteImage style={styles.postImage} uri={post.imageUrl}>
          <Ionicons name="fish-outline" size={42} color={colors.secondary} />
        </RemoteImage>
      ) : null}
      <Text style={styles.primaryText}>{post.weightLabel}</Text>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={13} color={colors.textMuted} />
        <Text numberOfLines={1} style={styles.muted}>{post.spotName}</Text>
      </View>
      <View style={styles.actionsRow}>
        <Text style={styles.actionText}>{post.likes} j'aime</Text>
        <Text style={styles.actionText}>{post.comments} commentaires</Text>
      </View>
    </Card>
  );
}

function SpotSuggestion({ onPress, spot }: { onPress: () => void; spot: FishingSpot }) {
  return (
    <Card accessibilityLabel={`Ouvrir le spot ${spot.name}`} onPress={onPress} padding="md" style={styles.spotSuggestion}>
      <View style={styles.spotIcon}>
        <Ionicons name="location" size={20} color={colors.primary} />
      </View>
      <Text numberOfLines={2} style={styles.spotName}>{spot.name}</Text>
      <Text style={styles.muted}>{spot.distanceLabel}</Text>
      <View style={styles.spotFooter}>
        <Text style={styles.actionText}>{spot.rating > 0 ? spot.rating.toFixed(1) : spot.waterType === 'freshwater' ? 'Eau douce' : 'Mer'}</Text>
        <Badge label={`${spot.favoritesCount ?? 0} favoris`} tone="secondary" />
      </View>
    </Card>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<RootNavigation>();
  const { data: posts, loading: postsLoading } = usePosts();
  const { data: spots } = useSpots();
  const { data: profile } = useProfile();

  const recentPosts = posts.slice(0, 3);
  const recommendedSpots = spots.slice(0, 3);
  const profileStatValue = (id: string, fallback: string) => profile?.stats.find((stat) => stat.id === id)?.value ?? fallback;

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
        logo
      />

      <View style={styles.content}>
        <View>
          <Text style={styles.greeting}>Bonjour {profile?.displayName.split(' ')[0] ?? 'Marc'}</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.muted}>Pret pour une nouvelle session ?</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatTile icon="fish-outline" label="Prises" tone="primary" value={profileStatValue('catches', String(posts.length))} />
          <StatTile icon="location-outline" label="Spots" tone="secondary" value={profileStatValue('spots', String(spots.length))} />
          <StatTile icon="trophy-outline" label="Score" tone="earth" value={profileStatValue('score', '0')} />
        </View>

        <Card elevated style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <View style={styles.challengeTitleRow}>
              <Ionicons name="radio-button-on-outline" size={22} color={colors.background} />
              <Text style={styles.challengeTitle}>Defi du jour</Text>
            </View>
            <Badge label="+50 XP" tone="neutral" style={styles.challengeBadge} textStyle={styles.challengeBadgeText} />
          </View>
          <Text style={styles.challengeText}>Attrapez un poisson de plus de 2 kg</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${challengeProgress * 100}%` }]} />
          </View>
          <Text style={styles.challengeMeta}>60% complete</Text>
        </Card>

        <Button
          accessibilityLabel="Nouvelle session de peche"
          iconLeft="add"
          onPress={() => navigation.navigate('MainTabs', { screen: 'Map' })}
          title="Nouvelle session de peche"
        />

        <SectionTitle
          action={<Button onPress={() => navigation.navigate('MainTabs', { screen: 'Community' })} size="sm" title="Tout voir" variant="ghost" />}
          icon="fish-outline"
          title="Prises recentes"
        />

        {postsLoading ? (
          <EmptyState description="Chargement des prises recentes." icon="fish-outline" title="Chargement" />
        ) : null}

        {!postsLoading && recentPosts.map((post) => (
          <RecentPostCard
            key={post.id}
            onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
            post={post}
          />
        ))}

        {!postsLoading && recentPosts.length === 0 ? (
          <EmptyState description="Aucune prise n'est disponible pour le moment." icon="fish-outline" title="Aucune prise" />
        ) : null}

        <SectionTitle icon="navigate-outline" title="Spots recommandes" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.horizontalList}>
            {recommendedSpots.map((spot) => (
              <SpotSuggestion
                key={spot.id}
                onPress={() => navigation.navigate('SpotDetail', { spotId: spot.id })}
                spot={spot}
              />
            ))}
            {recommendedSpots.length === 0 ? (
              <EmptyState description="Aucun spot n'est disponible pour le moment." icon="location-outline" title="Aucun spot" />
            ) : null}
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    padding: spacing.xxl,
  },
  greeting: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 24,
    fontWeight: typography.weights.bold,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statusDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    height: 8,
    width: 8,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statTile: {
    borderWidth: 0,
    flex: 1,
    minHeight: 104,
  },
  statValue: {
    color: colors.background,
    fontFamily: typography.fontFamilyBold,
    fontSize: 22,
    fontWeight: typography.weights.bold,
    marginTop: spacing.sm,
  },
  statLabel: {
    color: opacity.surface88,
    fontFamily: typography.fontFamilyBold,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  challengeCard: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  challengeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  challengeTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  challengeTitle: {
    color: colors.background,
    fontFamily: typography.fontFamilyBold,
    fontSize: 16,
    fontWeight: typography.weights.bold,
  },
  challengeBadge: {
    backgroundColor: opacity.surface88,
  },
  challengeBadgeText: {
    color: colors.primary,
  },
  challengeText: {
    color: opacity.surface96,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    marginTop: spacing.md,
  },
  progressTrack: {
    backgroundColor: opacity.surface88,
    borderRadius: radius.round,
    height: 8,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.background,
    borderRadius: radius.round,
    height: '100%',
  },
  challengeMeta: {
    color: opacity.surface88,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  postCard: {
    gap: spacing.md,
  },
  postImage: {
    borderRadius: radius.lg,
    height: 160,
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
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  postTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 18,
    fontWeight: typography.weights.bold,
  },
  primaryText: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
    fontWeight: typography.weights.bold,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionsRow: {
    borderTopColor: opacity.black08,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  actionText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  horizontalList: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  spotSuggestion: {
    gap: spacing.sm,
    minHeight: 150,
    width: 178,
  },
  spotIcon: {
    alignItems: 'center',
    backgroundColor: opacity.primary10,
    borderRadius: radius.md,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  spotName: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
    fontWeight: typography.weights.bold,
  },
  spotFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
});
