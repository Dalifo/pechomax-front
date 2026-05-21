import { colors } from '../theme/theme';
import {
  AuthUser,
  CatchPost,
  CatchPostDetail,
  ConversationSummary,
  FishSpecies,
  FishingSpot,
  LogbookCatch,
  Message,
  PostComment,
  SpotComment,
  UserSummary,
  WaterType,
} from '../types/domain';
import { Badge, BadgeRarity, IconName, UserProfile } from '../types/profile';
import {
  BackendAuthPayload,
  BackendAuthSelf,
  BackendCatch,
  BackendCatchComment,
  BackendConversation,
  BackendLocation,
  BackendLocationComment,
  BackendMessage,
  BackendSpecies,
  BackendUser,
} from './backendTypes';
import { enrichSpecies } from './speciesDetails';

function initialsFromName(name: string) {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function compactLocation(user?: BackendUser | null) {
  return [user?.city, user?.region].filter(Boolean).join(', ') || undefined;
}

function relativeDateLabel(value?: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) {
    return "A l'instant";
  }

  if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `Il y a ${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return 'Hier';
  }

  return `Il y a ${diffDays}j`;
}

function dateTimeLabel(value?: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function timeLabel(value?: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function mapUserSummary(user?: BackendUser | null, fallbackId = ''): UserSummary {
  const name = user?.username || 'Pecheur PechoMax';

  return {
    id: user?.id || fallbackId,
    initials: initialsFromName(name) || 'PM',
    level: user?.level?.value ?? undefined,
    location: compactLocation(user),
    name,
    profilePic: user?.profile_pic ?? undefined,
  };
}

function numberFromBackend(value: number | string | null | undefined) {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : value;
  return Number.isFinite(parsed) ? Number(parsed) : 0;
}

export function mapAuthUserFromPayload(payload: BackendAuthPayload | BackendAuthSelf, email = ''): AuthUser {
  const sub = 'sub' in payload ? payload.sub : payload;
  const name = sub.username;

  return {
    email,
    id: sub.id,
    initials: initialsFromName(name) || 'PM',
    level: undefined,
    name,
  };
}

export function mapAuthUserFromUser(user: BackendUser): AuthUser {
  return {
    bio: compactLocation(user),
    email: user.email,
    ...mapUserSummary(user),
  };
}

export function mapCatchPost(item: BackendCatch): CatchPost {
  const pictures = Array.isArray(item.pictures) ? item.pictures : [];
  const imageUrl = pictures.find((picture) => /^https?:\/\//i.test(picture));

  return {
    author: mapUserSummary(item.user, item.user_id ?? ''),
    bookmarked: Boolean(item.isSavedByMe),
    comments: numberFromBackend(item.commentsCount),
    content: item.description || `Nouvelle prise: ${item.species?.name ?? 'Poisson'}`,
    createdAtLabel: relativeDateLabel(item.created_at ?? item.date),
    fishName: item.species?.name ?? 'Poisson',
    hasPhoto: Boolean(imageUrl),
    id: item.id,
    imageUrl,
    lengthLabel: `${item.length} cm`,
    liked: Boolean(item.isLikedByMe),
    likes: numberFromBackend(item.likesCount),
    spotId: item.location?.id ?? item.location_id,
    spotName: item.location?.name,
    weightLabel: `${item.weight} g`,
  };
}

export function mapCatchPostDetail(item: BackendCatch): CatchPostDetail {
  return {
    ...mapCatchPost(item),
    commentsList: [],
    description: item.description || '',
    detailDateLabel: dateTimeLabel(item.date),
    saves: numberFromBackend(item.savesCount),
  };
}

export function mapPostComment(item: BackendCatchComment): PostComment {
  return {
    author: mapUserSummary(item.user, item.user_id),
    id: item.id,
    text: item.content,
    timeLabel: relativeDateLabel(item.created_at),
  };
}

function waterTypeFromLocation(location: BackendLocation): WaterType {
  if (location.water_type === 'freshwater') {
    return 'freshwater';
  }

  if (location.water_type === 'sea') {
    return 'saltwater';
  }

  const searchable = `${location.name} ${location.description ?? ''}`.toLowerCase();
  return /mer|port|ocean|oc[eé]an|plage|c[oô]te/.test(searchable) ? 'saltwater' : 'freshwater';
}

function mapPosition(location: BackendLocation) {
  const longitude = Number.parseFloat(location.longitude);
  const latitude = Number.parseFloat(location.latitude);

  if (!isValidCoordinate(latitude, longitude)) {
    return undefined;
  }

  return {
    xPct: Math.min(92, Math.max(8, ((longitude + 180) / 360) * 100)),
    yPct: Math.min(92, Math.max(8, ((90 - latitude) / 180) * 100)),
  };
}

function isValidCoordinate(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function mapFishingSpot(item: BackendLocation): FishingSpot {
  const fish = item.speciesLocations?.map((speciesLocation) => speciesLocation.species?.name).filter(Boolean) as string[];
  const longitude = Number.parseFloat(item.longitude);
  const latitude = Number.parseFloat(item.latitude);
  const hasCoordinates = isValidCoordinate(latitude, longitude);
  const pictures = Array.isArray(item.pictures) ? item.pictures : [];
  const imageUrl = pictures.find((picture) => /^https?:\/\//i.test(picture));

  return {
    activeUsers: undefined,
    comments: [],
    commentsCount: numberFromBackend(item.commentsCount),
    conditions: item.description ?? undefined,
    coordinates: hasCoordinates ? { latitude, longitude } : undefined,
    favorite: Boolean(item.isFavoriteByMe),
    favoritesCount: numberFromBackend(item.favoritesCount),
    fish,
    id: item.id,
    imageUrl,
    location: item.user?.region || item.user?.city || `${item.latitude}, ${item.longitude}`,
    mapPosition: mapPosition(item),
    myRating: item.myRating == null ? null : numberFromBackend(item.myRating),
    name: item.name,
    photos: pictures.length,
    rating: Number(item.averageRating ?? 0),
    ratingsCount: numberFromBackend(item.ratingsCount),
    waterType: waterTypeFromLocation(item),
  };
}

export function mapSpotComment(item: BackendLocationComment): SpotComment {
  return {
    author: mapUserSummary(item.user, item.user_id),
    id: item.id,
    text: item.content,
    timeLabel: relativeDateLabel(item.created_at),
  };
}

export function mapFishSpecies(item: BackendSpecies): FishSpecies {
  const locations = item.speciesLoactions?.map((link) => link.location?.name).filter(Boolean) as string[];
  const details = enrichSpecies(item.name);

  return {
    ...details,
    description: details.description,
    habitat: locations.length > 0 ? `${details.habitat} Spots PechoMax connus : ${locations.join(', ')}.` : details.habitat,
    id: item.id,
    name: item.name ?? 'Espece',
  };
}

export function mapConversation(item: BackendConversation, currentUserId?: string | null): ConversationSummary {
  const latest = item.messages?.[0];
  const messageParticipant = item.messages
    ?.map((message) => message.user)
    .find((user) => user?.id && user.id !== currentUserId);
  const participant = item.user?.id === currentUserId ? item.recipient : item.user;
  const fallbackUser = participant ?? messageParticipant ?? item.recipient ?? item.user;

  return {
    id: item.id,
    lastMessage: latest?.content || item.title,
    online: false,
    timeLabel: latest?.created_at ? timeLabel(latest.created_at) : relativeDateLabel(item.updated_at),
    unreadCount: 0,
    user: mapUserSummary(fallbackUser, fallbackUser?.id ?? item.user_id),
  };
}

export function mapMessage(item: BackendMessage, currentUserId?: string | null): Message {
  return {
    conversationId: item.conversation_id,
    id: item.id,
    sender: currentUserId && item.user_id === currentUserId ? 'me' : 'them',
    text: item.content,
    timeLabel: timeLabel(item.created_at),
  };
}

export function mapLogbookCatch(item: BackendCatch): LogbookCatch {
  const pictures = Array.isArray(item.pictures) ? item.pictures : [];

  return {
    date: item.date,
    id: item.id,
    imageUrl: pictures.find((picture) => /^https?:\/\//i.test(picture)),
    length: item.length,
    location: item.location?.name ?? 'Spot PechoMax',
    species: item.species?.name ?? 'Poisson',
    technique: 'Non renseignee',
    time: timeLabel(item.created_at),
    weight: item.weight,
  };
}

function rankTitleForLevel(value: number, title?: string | null) {
  const normalized = title?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  if (normalized?.includes('legende') || value >= 6) {
    return 'Maître des poissons';
  }

  if (normalized?.includes('guide') || value >= 5) {
    return 'Gardien des spots';
  }

  if (normalized?.includes('expert') || value >= 4) {
    return 'Maître des eaux';
  }

  if (normalized?.includes('confirme') || value >= 3) {
    return 'Brochet aguerri';
  }

  if (normalized?.includes('amateur') || value >= 2) {
    return 'Perche curieuse';
  }

  return 'Poisson-chat';
}

function badgeProgress(current: number, target: number) {
  return Math.min(target, Math.max(0, current));
}

function profileBadges(user: BackendUser, level: number): Badge[] {
  const catches = user.catches ?? [];
  const locations = user.locations ?? [];
  const catchCount = catches.length;
  const spotCount = locations.length;
  const uniqueSpecies = new Set(catches.map((catchItem) => catchItem.species_id).filter(Boolean)).size;
  const uniqueCatchDates = new Set(catches.map((catchItem) => catchItem.date).filter(Boolean)).size;
  const biggestWeight = Math.max(0, ...catches.map((catchItem) => Number(catchItem.weight ?? 0)));
  const biggestLength = Math.max(0, ...catches.map((catchItem) => Number(catchItem.length ?? 0)));
  const score = user.score ?? 0;

  const makeBadge = (
    id: number,
    category: string,
    name: string,
    description: string,
    condition: string,
    icon: IconName,
    current: number,
    target: number,
    rarity: BadgeRarity = 'common',
  ): Badge => ({
    category,
    condition,
    description,
    icon,
    id,
    name,
    progress: badgeProgress(current, target),
    rarity,
    target,
    unlocked: current >= target,
  });

  return [
    makeBadge(1, 'Début', 'Première prise', 'Publier sa première prise dans PechoMax.', 'Au moins 1 prise publiée', 'fish-outline', catchCount, 1),
    makeBadge(2, 'Début', 'Carnet lancé', 'Commencer à remplir son journal de bord.', 'Au moins 3 prises publiées', 'book-outline', catchCount, 3),
    makeBadge(3, 'Progression', 'Carnet actif', 'Alimenter régulièrement son historique.', 'Au moins 5 prises publiées', 'file-tray-full-outline', catchCount, 5, 'rare'),
    makeBadge(4, 'Progression', 'Pêcheur régulier', 'Construire un vrai suivi de sorties.', 'Au moins 10 prises publiées', 'calendar-outline', catchCount, 10, 'rare'),
    makeBadge(5, 'Exploration', 'Premier spot', 'Ajouter un spot utile à son profil.', 'Au moins 1 spot créé', 'location-outline', spotCount, 1),
    makeBadge(6, 'Exploration', 'Explorateur', 'Partager plusieurs lieux de pêche.', 'Au moins 3 spots créés', 'map-outline', spotCount, 3, 'rare'),
    makeBadge(7, 'Exploration', 'Guide local', 'Devenir une référence sur les spots.', 'Au moins 5 spots créés', 'navigate-outline', spotCount, 5, 'epic'),
    makeBadge(8, 'Espèces', 'Collectionneur', 'Varier les espèces capturées.', 'Au moins 5 espèces différentes', 'albums-outline', uniqueSpecies, 5, 'rare'),
    makeBadge(9, 'Espèces', 'Naturaliste', 'Explorer une grande diversité de poissons.', 'Au moins 10 espèces différentes', 'leaf-outline', uniqueSpecies, 10, 'epic'),
    makeBadge(10, 'Performance', 'Belle prise', 'Capturer un poisson solide.', 'Une prise de 2 kg ou plus', 'scale-outline', biggestWeight, 2000, 'rare'),
    makeBadge(11, 'Performance', 'Très belle prise', 'Capturer un poisson marquant.', 'Une prise de 5 kg ou plus', 'trophy-outline', biggestWeight, 5000, 'epic'),
    makeBadge(12, 'Performance', 'Grand format', 'Capturer un poisson de belle longueur.', 'Une prise de 80 cm ou plus', 'resize-outline', biggestLength, 80, 'rare'),
    makeBadge(13, 'Régularité', 'Trois sorties', 'Publier des prises sur plusieurs dates.', 'Au moins 3 dates de prises différentes', 'time-outline', uniqueCatchDates, 3),
    makeBadge(14, 'Régularité', 'Saison active', 'Garder un rythme sur la saison.', 'Au moins 7 dates de prises différentes', 'sunny-outline', uniqueCatchDates, 7, 'rare'),
    makeBadge(15, 'Progression', 'Confirmé', 'Atteindre un niveau solide.', 'Niveau 3 ou plus', 'ribbon-outline', level, 3, 'rare'),
    makeBadge(16, 'Progression', 'Maître des eaux', 'Passer dans les niveaux avancés.', 'Niveau 4 ou plus', 'water-outline', level, 4, 'epic'),
    makeBadge(17, 'Progression', 'Score solide', 'Cumuler de l’expérience avec ses prises.', 'Atteindre 5 000 XP', 'trending-up-outline', score, 5000, 'rare'),
  ];
}

export function mapUserProfile(user: BackendUser): UserProfile {
  const catchCount = user.catches?.length ?? 0;
  const spotCount = user.locations?.length ?? 0;
  const level = user.level?.value ?? 1;
  const levelTitle = user.level?.title ?? `Niveau ${level}`;
  const rankTitle = rankTitleForLevel(level, levelTitle);
  const score = user.score ?? 0;
  const nextLevel = user.level?.end ?? Math.max(1000, score + 500);

  return {
    achievements: [
      { color: colors.earth, icon: 'trophy-outline', id: 'score', label: 'Score', value: String(score) },
      { color: colors.primary, icon: 'fish-outline', id: 'catches', label: 'Prises', value: String(catchCount) },
      { color: colors.secondary, icon: 'radio-button-on-outline', id: 'level', label: 'Niveau', value: String(level) },
    ],
    // TEMP_STATIC_BADGES: frontend-only badge definitions until a backend badge system exists.
    badges: profileBadges(user, level),
    displayName: user.username,
    headline: [user.city, user.region].filter(Boolean).join(', ') || 'Pêcheur PechoMax',
    profilePic: user.profile_pic ?? undefined,
    infoItems: ['À propos', 'Aide et support', "Conditions d'utilisation"],
    level,
    levelTitle,
    rankTitle,
    menuItems: [
      { count: spotCount, icon: 'location-outline', id: 'spots', label: 'Mes spots favoris' },
      { count: catchCount, icon: 'fish-outline', id: 'catches', label: 'Historique des prises' },
      { count: level, icon: 'trophy-outline', id: 'achievements', label: 'Trophées et badges' },
      { icon: 'settings-outline', id: 'settings', label: 'Paramètres', route: 'Settings' },
    ],
    stats: [
      { icon: 'fish-outline', id: 'catches', label: 'Prises', value: String(catchCount) },
      { icon: 'location-outline', id: 'spots', label: 'Spots', value: String(spotCount) },
      { icon: 'trophy-outline', id: 'level', label: 'Niveau', value: levelTitle },
    ],
    xp: {
      current: score,
      nextLevel,
    },
  };
}
