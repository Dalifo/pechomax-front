import { NavigatorScreenParams } from '@react-navigation/native';
import { EntityId, UserSummary } from '../types/domain';

export type MainTabParamList = {
  Home: undefined;
  Map: { spotId?: string } | undefined;
  Community: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  PostDetail: { postId: EntityId };
  CreatePost: undefined;
  SpotDetail: { spotId: EntityId };
  Conversation: { conversationId: EntityId; recipient?: UserSummary };
  EditProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
  UserProfile: { userId: EntityId };
  FishDatabase: undefined;
  FishDetail: { fishId: EntityId };
  Articles: undefined;
  Tools: undefined;
  Shops: undefined;
  Logbook: undefined;
  MySpots: undefined;
  Trophies: undefined;
  UserGuide: undefined;
  FAQ: undefined;
  Contact: undefined;
};
