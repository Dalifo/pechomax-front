export type BackendLevel = {
  id: string;
  title: string;
  value: number;
  start: number;
  end: number | null;
};

export type BackendUser = {
  id: string;
  username: string;
  email: string;
  role: 'Admin' | 'User';
  phone_number?: string | null;
  profile_pic?: string | null;
  city?: string | null;
  region?: string | null;
  zip_code?: string | null;
  level_id?: string | null;
  score?: number | null;
  created_at?: string;
  updated_at?: string;
  level?: BackendLevel | null;
  catches?: BackendCatch[];
  locations?: BackendLocation[];
};

export type BackendAuthPayload = {
  sub: {
    id: string;
    username: string;
    score?: number | null;
  };
  role?: 'Admin' | 'User';
  token?: string;
};

export type BackendAuthSelf = BackendAuthPayload['sub'];

export type BackendSpecies = {
  id: string;
  name?: string | null;
  point_value: number;
  created_at?: string;
  updated_at?: string;
  speciesLoactions?: BackendSpeciesLocation[];
};

export type BackendLocation = {
  id: string;
  longitude: string;
  latitude: string;
  name: string;
  description?: string | null;
  pictures?: string[] | null;
  water_type?: 'freshwater' | 'sea' | null;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
  user?: BackendUser | null;
  speciesLocations?: BackendSpeciesLocation[];
  averageRating?: number | string | null;
  commentsCount?: number | string | null;
  favoritesCount?: number | string | null;
  isFavoriteByMe?: boolean | null;
  myRating?: number | string | null;
  ratingsCount?: number | string | null;
};

export type BackendLocationComment = {
  id: string;
  location_id: string;
  user_id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  user?: BackendUser | null;
};

export type BackendLocationRatingSummary = {
  averageRating: number | string | null;
  myRating?: number | string | null;
  ratingsCount: number | string | null;
};

export type BackendSpeciesLocation = {
  id: string;
  species_id?: string | null;
  location_id?: string | null;
  created_at?: string;
  updated_at?: string;
  species?: BackendSpecies | null;
  location?: BackendLocation | null;
};

export type BackendCatch = {
  id: string;
  length: number;
  weight: number;
  location_id: string;
  pictures: string[];
  description?: string | null;
  point_value: number;
  date: string;
  species_id?: string | null;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
  user?: BackendUser | null;
  species?: BackendSpecies | null;
  location?: BackendLocation | null;
  likesCount?: number | string | null;
  commentsCount?: number | string | null;
  savesCount?: number | string | null;
  isLikedByMe?: boolean | null;
  isSavedByMe?: boolean | null;
};

export type BackendCatchSocial = {
  likesCount: number | string;
  commentsCount: number | string;
  savesCount: number | string;
  isLikedByMe: boolean;
  isSavedByMe: boolean;
};

export type BackendCatchComment = {
  id: string;
  catch_id: string;
  user_id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  user?: BackendUser | null;
};

export type BackendCategory = {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

export type BackendMessage = {
  id: string;
  content: string;
  pictures: string[];
  user_id: string;
  conversation_id: string;
  created_at?: string;
  updated_at?: string;
  user?: BackendUser | null;
};

export type BackendConversation = {
  id: string;
  title: string;
  category_id?: string | null;
  recipient_id?: string | null;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  user?: BackendUser | null;
  recipient?: BackendUser | null;
  category?: BackendCategory | null;
  messages?: BackendMessage[];
};
