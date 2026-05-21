import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

type DailyChallenge = {
  category: 'catch' | 'explore' | 'community' | 'species' | 'spot';
  description: string;
  difficulty: 'Facile' | 'Intermédiaire' | 'Expert';
  icon: IconName;
  id: string;
  kind: 'numeric' | 'binary';
  target?: number;
  title: string;
};

type Coordinate = {
  latitude: number;
  longitude: number;
};

type ChallengeState =
  | { completed: boolean; current: number; progress: number; target: number }
  | { completed: boolean; current?: never; progress?: never; target?: never };

// TEMP_STATIC_CHALLENGES: local deterministic home challenges until a backend challenge system exists.
const dailyChallenges: DailyChallenge[] = [
  { category: 'catch', description: 'Publiez trois prises sur votre journal PechoMax.', difficulty: 'Intermédiaire', icon: 'fish-outline', id: 'catch-3', kind: 'numeric', target: 3, title: 'Attraper 3 poissons' },
  { category: 'catch', description: 'Partagez une nouvelle prise avec une photo.', difficulty: 'Facile', icon: 'camera-outline', id: 'publish-catch', kind: 'binary', title: 'Publier une prise' },
  { category: 'spot', description: 'Ajoutez un spot utile pour la communaute.', difficulty: 'Facile', icon: 'location-outline', id: 'add-spot', kind: 'binary', title: 'Ajouter un spot' },
  { category: 'spot', description: 'Renseignez au moins trois spots dans votre profil.', difficulty: 'Intermédiaire', icon: 'map-outline', id: 'spots-3', kind: 'numeric', target: 3, title: 'Explorer 3 spots' },
  { category: 'catch', description: 'Atteignez cinq prises publiées sur PechoMax.', difficulty: 'Intermédiaire', icon: 'file-tray-full-outline', id: 'catch-5', kind: 'numeric', target: 5, title: 'Attraper 5 poissons' },
  { category: 'catch', description: 'Publiez une prise de plus de 2 kg.', difficulty: 'Intermédiaire', icon: 'scale-outline', id: 'heavy-fish', kind: 'binary', title: 'Attraper un poisson de plus de 2 kg' },
  { category: 'species', description: 'Essayez une espèce différente lors de votre prochaine sortie.', difficulty: 'Intermédiaire', icon: 'fish-outline', id: 'new-species', kind: 'binary', title: 'Varier les espèces' },
  { category: 'spot', description: 'Ouvrez un spot mer et preparez une session adaptee.', difficulty: 'Facile', icon: 'water-outline', id: 'sea-spot', kind: 'binary', title: 'Preparer une sortie mer' },
  { category: 'spot', description: 'Ouvrez un spot eau douce et reperez les poissons presents.', difficulty: 'Facile', icon: 'leaf-outline', id: 'freshwater-spot', kind: 'binary', title: 'Preparer une sortie eau douce' },
  { category: 'community', description: 'Ajoutez un commentaire utile sur une prise ou un spot.', difficulty: 'Facile', icon: 'chatbubble-outline', id: 'comment', kind: 'binary', title: 'Aider la communaute' },
  { category: 'explore', description: 'Consultez la carte et choisissez votre prochaine destination.', difficulty: 'Facile', icon: 'navigate-outline', id: 'open-map', kind: 'binary', title: 'Explorer la carte' },
  { category: 'catch', description: 'Atteignez dix prises publiées sur PechoMax.', difficulty: 'Expert', icon: 'trophy-outline', id: 'catch-10', kind: 'numeric', target: 10, title: 'Compléter 10 prises' },
  { category: 'spot', description: 'Ajoutez cinq spots avec des informations utiles.', difficulty: 'Expert', icon: 'flag-outline', id: 'spots-5', kind: 'numeric', target: 5, title: 'Construire sa carte' },
  { category: 'catch', description: 'Publiez une prise récente avec poids, longueur et spot.', difficulty: 'Facile', icon: 'add-circle-outline', id: 'complete-catch', kind: 'binary', title: 'Compléter une fiche prise' },
  { category: 'species', description: 'Reperez les poissons disponibles sur un spot proche.', difficulty: 'Facile', icon: 'search-outline', id: 'spot-species', kind: 'binary', title: 'Identifier les poissons' },
  { category: 'spot', description: 'Sauvegardez un spot interessant pour une prochaine sortie.', difficulty: 'Facile', icon: 'heart-outline', id: 'favorite-spot', kind: 'binary', title: 'Mettre un spot en favori' },
  { category: 'spot', description: 'Notez un spot apres l avoir consulte.', difficulty: 'Facile', icon: 'star-outline', id: 'rate-spot', kind: 'binary', title: 'Noter un spot' },
  { category: 'catch', description: 'Atteignez le prochain niveau avec vos prises.', difficulty: 'Intermédiaire', icon: 'trending-up-outline', id: 'level-progress', kind: 'numeric', target: 100, title: 'Progresser vers le niveau suivant' },
  { category: 'explore', description: 'Trouvez un spot a moins de 150 km.', difficulty: 'Facile', icon: 'compass-outline', id: 'nearby-spot', kind: 'binary', title: 'Trouver un spot proche' },
  { category: 'community', description: 'Consultez les prises recentes de la communaute.', difficulty: 'Facile', icon: 'people-outline', id: 'community-feed', kind: 'binary', title: 'Suivre la communaute' },
  { category: 'catch', description: 'Publiez deux prises pour alimenter votre logbook.', difficulty: 'Intermédiaire', icon: 'book-outline', id: 'catch-2', kind: 'numeric', target: 2, title: 'Remplir le logbook' },
  { category: 'spot', description: 'Ajoutez une photo à un spot pour aider les autres pêcheurs.', difficulty: 'Intermédiaire', icon: 'image-outline', id: 'spot-photo', kind: 'binary', title: 'Illustrer un spot' },
];

// TEMP_FALLBACK_DATA: approximate city coordinates used only when GPS is already unavailable.
const cityCoordinates: Record<string, Coordinate> = {
  annecy: { latitude: 45.8992, longitude: 6.1294 },
  bordeaux: { latitude: 44.8378, longitude: -0.5792 },
  lyon: { latitude: 45.764, longitude: 4.8357 },
  marseille: { latitude: 43.2965, longitude: 5.3698 },
  tours: { latitude: 47.3941, longitude: 0.6848 },
  vannes: { latitude: 47.6582, longitude: -2.7608 },
};

function getDayIndex(date = new Date()) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

function getDailyChallenge(date = new Date()) {
  return dailyChallenges[getDayIndex(date) % dailyChallenges.length];
}

function profileStatNumber(profile: ReturnType<typeof useProfile>['data'], id: string, fallback = 0) {
  const value = profile?.stats.find((stat) => stat.id === id)?.value;
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function challengeState(challenge: DailyChallenge, profile: ReturnType<typeof useProfile>['data'], posts: CatchPost[], spots: FishingSpot[]): ChallengeState {
  const catchCount = profileStatNumber(profile, 'catches', posts.length);
  const spotCount = profileStatNumber(profile, 'spots', spots.length);
  const xp = profile?.xp;

  if (challenge.kind === 'numeric') {
    const target = challenge.target ?? 1;
    const current =
      challenge.id === 'spots-3' || challenge.id === 'spots-5'
        ? spotCount
        : challenge.id === 'level-progress' && xp
          ? Math.round(Math.min(100, (xp.current / Math.max(1, xp.nextLevel)) * 100))
          : catchCount;

    return {
      completed: current >= target,
      current: Math.min(current, target),
      progress: Math.min(1, Math.max(0, current / target)),
      target,
    };
  }

  const completed =
    ['publish-catch', 'complete-catch', 'new-species'].includes(challenge.id)
      ? catchCount > 0
      : challenge.id === 'spot-photo'
        ? spots.some((spot) => Boolean(spot.imageUrl))
      : challenge.id === 'add-spot'
        ? spotCount > 0
      : challenge.id === 'favorite-spot'
        ? spots.some((spot) => Boolean(spot.favorite))
      : challenge.id === 'rate-spot'
        ? spots.some((spot) => Boolean(spot.myRating))
      : challenge.id === 'heavy-fish'
        ? false
      : challenge.id === 'comment'
        ? false
      : challenge.id === 'open-map'
        ? false
      : challenge.id === 'community-feed'
        ? false
        : ['sea-spot'].includes(challenge.id)
          ? spots.some((spot) => spot.waterType === 'saltwater')
          : ['freshwater-spot', 'spot-species', 'nearby-spot'].includes(challenge.id)
            ? spots.some((spot) => spot.waterType === 'freshwater')
            : posts.length > 0 || spots.length > 0;

  return { completed };
}

function distanceKm(from: Coordinate, to: Coordinate) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function coordinateFromProfile(profile: ReturnType<typeof useProfile>['data']) {
  const searchable = profile?.headline.toLowerCase() ?? '';
  const key = Object.keys(cityCoordinates).find((city) => searchable.includes(city));
  return key ? cityCoordinates[key] : null;
}

function formatDistance(distance?: number) {
  if (!Number.isFinite(distance)) {
    return 'Distance a verifier';
  }

  return `${Math.max(1, Math.round(distance ?? 0))} km`;
}

function StatTile({ icon, label, onPress, value, tone }: { icon: IconName; label: string; onPress?: () => void; value: string; tone: 'primary' | 'secondary' | 'earth' }) {
  const backgroundColor = tone === 'primary' ? colors.primary : tone === 'secondary' ? colors.secondary : colors.earth;

  return (
    <Card onPress={onPress} padding="md" style={[styles.statTile, { backgroundColor }]}>
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
  const { data: posts, loading: postsLoading, refresh: refreshPosts } = usePosts();

  useFocusEffect(useCallback(() => { refreshPosts(); }, [refreshPosts]));
  const { data: spots } = useSpots();
  const { data: profile } = useProfile();
  const [userCoordinate, setUserCoordinate] = useState<Coordinate | null>(null);

  useEffect(() => {
    let active = true;

    async function loadExistingLocation() {
      const permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted) {
        return;
      }

      try {
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (active) {
          setUserCoordinate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
      } catch {
        if (active) {
          setUserCoordinate(null);
        }
      }
    }

    void loadExistingLocation();

    return () => {
      active = false;
    };
  }, []);

  const dailyChallenge = useMemo(() => getDailyChallenge(), []);
  const dailyChallengeState = useMemo(
    () => challengeState(dailyChallenge, profile, posts, spots),
    [dailyChallenge, posts, profile, spots],
  );
  const recentPosts = posts.slice(0, 3);
  const profileStatValue = (id: string, fallback: string) => profile?.stats.find((stat) => stat.id === id)?.value ?? fallback;
  const recommendedSpots = useMemo(() => {
    const referenceCoordinate = userCoordinate ?? coordinateFromProfile(profile);
    const scoredSpots = spots
      .map((spot) => {
        const distance = referenceCoordinate && spot.coordinates ? distanceKm(referenceCoordinate, spot.coordinates) : undefined;
        return {
          distance,
          spot: {
            ...spot,
            distanceLabel: formatDistance(distance),
          },
        };
      })
      .sort((a, b) => {
        const aNearby = a.distance !== undefined && a.distance <= 150;
        const bNearby = b.distance !== undefined && b.distance <= 150;

        if (aNearby !== bNearby) {
          return aNearby ? -1 : 1;
        }

        if (a.distance !== undefined && b.distance !== undefined && a.distance !== b.distance) {
          return a.distance - b.distance;
        }

        const aScore = a.spot.rating * 10 + (a.spot.favoritesCount ?? 0);
        const bScore = b.spot.rating * 10 + (b.spot.favoritesCount ?? 0);
        return bScore - aScore;
      });

    return scoredSpots.slice(0, 4).map((item) => item.spot);
  }, [profile, spots, userCoordinate]);

  return (
    <Screen padded={false} scroll>
      <AppHeader
        action={
          <IconButton
            accessibilityLabel="Créer une publication"
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
            <Text style={styles.muted}>Prêt pour une nouvelle session ?</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatTile icon="fish-outline" label="Prises" onPress={() => navigation.navigate('Logbook')} tone="primary" value={profileStatValue('catches', String(posts.length))} />
          <StatTile icon="location-outline" label="Spots" onPress={() => navigation.navigate('MySpots')} tone="secondary" value={profileStatValue('spots', String(spots.length))} />
          <StatTile icon="trophy-outline" label="Niveau" tone="earth" value={profile?.rankTitle ?? profile?.levelTitle ?? `Niv. ${profile?.level ?? 1}`} />
        </View>

        <Card elevated style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <View style={styles.challengeTitleRow}>
              <Ionicons name={dailyChallenge.icon} size={22} color={colors.background} />
              <Text style={styles.challengeTitle}>Defi du jour</Text>
            </View>
            <Badge label={dailyChallenge.difficulty} tone="neutral" style={styles.challengeBadge} textStyle={styles.challengeBadgeText} />
          </View>
          <Text style={styles.challengeName}>{dailyChallenge.title}</Text>
          <Text style={styles.challengeText}>{dailyChallenge.description}</Text>
          {dailyChallengeState.target !== undefined ? (
            <>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${dailyChallengeState.progress * 100}%` }]} />
              </View>
              <Text style={styles.challengeMeta}>
                {dailyChallengeState.completed ? 'Terminé' : `${dailyChallengeState.current}/${dailyChallengeState.target}`}
              </Text>
            </>
          ) : (
            <View style={styles.binaryChallengeRow}>
              <Ionicons
                name={dailyChallengeState.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={colors.background}
              />
              <Text style={styles.challengeMeta}>{dailyChallengeState.completed ? 'Terminé' : 'À faire'}</Text>
            </View>
          )}
        </Card>

        <Button
          accessibilityLabel="Nouvelle session de pêche"
          iconLeft="add"
          onPress={() => navigation.navigate('MainTabs', { screen: 'Map' })}
          title="Nouvelle session de pêche"
        />

        <SectionTitle
          action={<Button onPress={() => navigation.navigate('MainTabs', { screen: 'Community' })} size="sm" title="Tout voir" variant="ghost" />}
          icon="fish-outline"
          title="Prises récentes"
        />

        {postsLoading ? (
          <EmptyState description="Chargement des prises récentes." icon="fish-outline" title="Chargement" />
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

        <SectionTitle
          action={<Button onPress={() => navigation.navigate('MainTabs', { screen: 'Map' })} size="sm" title="Voir plus" variant="ghost" />}
          icon="navigate-outline"
          title="Spots recommandés"
        />
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
  challengeName: {
    color: colors.background,
    fontFamily: typography.fontFamilyBold,
    fontSize: 18,
    fontWeight: typography.weights.bold,
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
  binaryChallengeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
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
