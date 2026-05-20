import { Ionicons } from '@expo/vector-icons';

export type IconName = keyof typeof Ionicons.glyphMap;

export type ProfileStat = {
  id: string;
  label: string;
  value: string;
  icon: IconName;
};

export type Achievement = {
  id: string;
  label: string;
  value: string;
  icon: IconName;
  color: string;
};

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type Badge = {
  id: number;
  name: string;
  icon: string;
  unlocked: boolean;
  rarity: BadgeRarity;
};

export type ProfileMenuItem = {
  id: string;
  label: string;
  icon: IconName;
  count?: number;
  route?: 'Settings';
};

export type UserProfile = {
  displayName: string;
  headline: string;
  profilePic?: string;
  level: number;
  xp: {
    current: number;
    nextLevel: number;
  };
  stats: ProfileStat[];
  achievements: Achievement[];
  badges: Badge[];
  menuItems: ProfileMenuItem[];
  infoItems: string[];
};
