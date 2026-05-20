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
  UserSummary,
  WaterType,
} from '../types/domain';
import { UserProfile } from '../types/profile';
import {
  BackendAuthPayload,
  BackendAuthSelf,
  BackendCatch,
  BackendConversation,
  BackendLocation,
  BackendMessage,
  BackendSpecies,
  BackendUser,
} from './backendTypes';

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
  const imageUrl = item.pictures.find((picture) => /^https?:\/\//i.test(picture));

  return {
    author: mapUserSummary(item.user, item.user_id ?? ''),
    bookmarked: false,
    comments: 0,
    content: item.description || `Nouvelle prise: ${item.species?.name ?? 'Poisson'}`,
    createdAtLabel: relativeDateLabel(item.created_at ?? item.date),
    fishName: item.species?.name ?? 'Poisson',
    hasPhoto: Boolean(imageUrl),
    id: item.id,
    imageUrl,
    lengthLabel: `${item.length} cm`,
    liked: false,
    likes: Math.max(0, Math.round((item.point_value ?? 0) / 100)),
    spotId: item.location?.id ?? item.location_id,
    spotName: item.location?.name,
    weightLabel: `${item.weight} kg`,
  };
}

export function mapCatchPostDetail(item: BackendCatch): CatchPostDetail {
  return {
    ...mapCatchPost(item),
    commentsList: [],
    description: item.description || '',
    detailDateLabel: dateTimeLabel(item.date),
    saves: 0,
  };
}

function waterTypeFromLocation(location: BackendLocation): WaterType {
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

  return {
    activeUsers: undefined,
    comments: [],
    conditions: item.description ?? undefined,
    coordinates: hasCoordinates ? { latitude, longitude } : undefined,
    fish,
    id: item.id,
    location: item.user?.region || item.user?.city || `${item.latitude}, ${item.longitude}`,
    mapPosition: mapPosition(item),
    name: item.name,
    photos: undefined,
    rating: 4,
    waterType: waterTypeFromLocation(item),
  };
}

export function mapFishSpecies(item: BackendSpecies): FishSpecies {
  const locations = item.speciesLoactions?.map((link) => link.location?.name).filter(Boolean) as string[];

  return {
    description: item.name ? `${item.name} reference dans PechoMax.` : 'Espece referencee dans PechoMax.',
    habitat: locations.length > 0 ? locations.join(', ') : 'Spots PechoMax',
    id: item.id,
    name: item.name ?? 'Espece',
    protectionStatus: 'A verifier localement',
    regulation: 'Reglementation locale a verifier avant la session.',
    scientificName: item.name ?? 'Non renseigne',
    season: 'A verifier',
    techniques: [],
    type: 'freshwater',
  };
}

export function mapConversation(item: BackendConversation): ConversationSummary {
  const latest = item.messages?.[0];

  return {
    id: item.id,
    lastMessage: latest?.content || item.title,
    online: false,
    timeLabel: relativeDateLabel(latest?.created_at ?? item.updated_at),
    unreadCount: 0,
    user: mapUserSummary(item.user, item.user_id),
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
  return {
    date: item.date,
    id: item.id,
    imageUrl: item.pictures.find((picture) => /^https?:\/\//i.test(picture)),
    length: item.length,
    location: item.location?.name ?? 'Spot PechoMax',
    species: item.species?.name ?? 'Poisson',
    technique: 'Non renseignee',
    time: timeLabel(item.created_at),
    weight: item.weight,
  };
}

export function mapUserProfile(user: BackendUser): UserProfile {
  const catchCount = user.catches?.length ?? 0;
  const spotCount = user.locations?.length ?? 0;
  const level = user.level?.value ?? 1;
  const score = user.score ?? 0;
  const nextLevel = user.level?.end ?? Math.max(1000, score + 500);

  return {
    achievements: [
      { color: colors.earth, icon: 'trophy-outline', id: 'score', label: 'Score', value: String(score) },
      { color: colors.primary, icon: 'fish-outline', id: 'catches', label: 'Prises', value: String(catchCount) },
      { color: colors.secondary, icon: 'radio-button-on-outline', id: 'level', label: 'Niveau', value: String(level) },
    ],
    badges: [
      { icon: 'fish-outline', id: 1, name: 'Premiere prise', rarity: 'common', unlocked: catchCount > 0 },
      { icon: 'map-outline', id: 2, name: 'Explorateur', rarity: 'common', unlocked: spotCount > 0 },
      { icon: 'trophy-outline', id: 3, name: 'Expert', rarity: 'rare', unlocked: level >= 5 },
    ],
    displayName: user.username,
    headline: [user.city, user.region].filter(Boolean).join(', ') || 'Pecheur PechoMax',
    profilePic: user.profile_pic ?? undefined,
    infoItems: ['A propos', 'Aide et support', "Conditions d'utilisation"],
    level,
    menuItems: [
      { count: spotCount, icon: 'location-outline', id: 'spots', label: 'Mes spots favoris' },
      { count: catchCount, icon: 'fish-outline', id: 'catches', label: 'Historique des prises' },
      { count: level, icon: 'trophy-outline', id: 'achievements', label: 'Trophees et badges' },
      { icon: 'settings-outline', id: 'settings', label: 'Parametres', route: 'Settings' },
    ],
    stats: [
      { icon: 'fish-outline', id: 'catches', label: 'Prises', value: String(catchCount) },
      { icon: 'location-outline', id: 'spots', label: 'Spots', value: String(spotCount) },
      { icon: 'radio-button-on-outline', id: 'score', label: 'Score', value: String(score) },
    ],
    xp: {
      current: score,
      nextLevel,
    },
  };
}
