import { IconName } from './profile';

export type EntityId = string;

export type WaterType = 'freshwater' | 'saltwater';

export type UserSummary = {
  id: EntityId;
  name: string;
  initials: string;
  level?: number;
  location?: string;
  profilePic?: string;
};

export type AuthUser = UserSummary & {
  email: string;
  bio?: string;
};

export type CatchPost = {
  id: EntityId;
  author: UserSummary;
  content: string;
  createdAtLabel: string;
  fishName: string;
  weightLabel?: string;
  lengthLabel?: string;
  spotId?: EntityId;
  spotName?: string;
  likes: number;
  comments: number;
  liked: boolean;
  bookmarked: boolean;
  hasPhoto?: boolean;
  imageUrl?: string;
};

export type PostComment = {
  id: EntityId;
  author: UserSummary;
  text: string;
  timeLabel: string;
};

export type CatchPostDetail = CatchPost & {
  detailDateLabel: string;
  description: string;
  saves: number;
  commentsList: PostComment[];
};

export type FishingSpot = {
  id: EntityId;
  name: string;
  location: string;
  waterType: WaterType;
  fish: string[];
  rating: number;
  distanceLabel?: string;
  activeUsers?: number;
  photos?: number;
  conditions?: string;
  mapPosition?: {
    xPct: number;
    yPct: number;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  comments?: SpotComment[];
  bathymetry?: {
    maxDepth: number;
    avgDepth: number;
    structure: string[];
    bottom: string;
    thermocline?: number | null;
  };
  hydrology?: {
    waterTemp: number;
    clarity: string;
    oxygenation: string;
    flow: string;
  };
};

export type SpotComment = {
  user: string;
  text: string;
  date: string;
};

export type FishSpecies = {
  id: EntityId;
  name: string;
  scientificName: string;
  type: WaterType;
  season: string;
  techniques: string[];
  regulation: string;
  protectionStatus: string;
  description: string;
  habitat: string;
};

export type ConversationSummary = {
  id: EntityId;
  user: UserSummary;
  lastMessage: string;
  timeLabel: string;
  unreadCount: number;
  online: boolean;
};

export type Message = {
  id: EntityId;
  conversationId: EntityId;
  sender: 'me' | 'them';
  text: string;
  timeLabel: string;
};

export type NotificationItem = {
  id: EntityId;
  type: 'like' | 'comment' | 'follow' | 'spot' | 'badge';
  actor: string;
  content: string;
  timeLabel: string;
  read: boolean;
  targetId?: EntityId;
};

export type SettingsSection = {
  title: string;
  items: SettingsItem[];
};

export type SettingsItem = {
  id: string;
  label: string;
  value?: string;
  icon: IconName;
};

export type Article = {
  id: EntityId;
  title: string;
  category: string;
  author: string;
  readTime: string;
  dateLabel: string;
  excerpt: string;
  views: number;
  saved: boolean;
};

export type Shop = {
  id: EntityId;
  name: string;
  type: string;
  address: string;
  distance: string;
  phone: string;
  rating: number;
  reviews: number;
  specialties: string[];
  services: string[];
};

export type FishingTool = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  value?: string;
  items?: string[];
};

export type LogbookCatch = {
  id: EntityId;
  species: string;
  length: number;
  weight: number;
  date: string;
  time: string;
  location: string;
  technique: string;
  imageUrl?: string;
};

export type ServiceResult<T> = Promise<T>;
