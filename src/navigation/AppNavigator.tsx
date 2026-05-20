import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { BottomTabBar } from '../components/navigation/BottomTabBar';
import { clearLocalAuthState } from '../services/authService';
import { subscribeUnauthorized } from '../services/httpClient';
import { ArticlesScreen } from '../screens/ArticlesScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { ConversationScreen } from '../screens/ConversationScreen';
import { ConversationsListScreen } from '../screens/ConversationsListScreen';
import { ContactScreen } from '../screens/ContactScreen';
import { CreatePostScreen } from '../screens/CreatePostScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { FAQScreen } from '../screens/FAQScreen';
import { FishDatabaseScreen } from '../screens/FishDatabaseScreen';
import { FishDetailScreen } from '../screens/FishDetailScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { LogbookScreen } from '../screens/LogbookScreen';
import { MapViewScreen } from '../screens/MapViewScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ShopsScreen } from '../screens/ShopsScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { SpotDetailScreen } from '../screens/SpotDetailScreen';
import { ToolsScreen } from '../screens/ToolsScreen';
import { TrophiesScreen } from '../screens/TrophiesScreen';
import { UserGuideScreen } from '../screens/UserGuideScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { MainTabParamList, RootStackParamList } from './types';

const Tabs = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tabs.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Map" component={MapViewScreen} />
      <Tabs.Screen name="Community" component={CommunityScreen} />
      <Tabs.Screen name="Messages" component={ConversationsListScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  useEffect(() => {
    return subscribeUnauthorized(() => {
      if (!navigationRef.isReady()) {
        return;
      }

      const currentRoute = navigationRef.getCurrentRoute();
      void clearLocalAuthState();

      if (
        currentRoute?.name !== 'Login' &&
        currentRoute?.name !== 'Register' &&
        currentRoute?.name !== 'Welcome' &&
        currentRoute?.name !== 'Splash'
      ) {
        navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    });
  }, [navigationRef]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
        <Stack.Screen name="SpotDetail" component={SpotDetailScreen} />
        <Stack.Screen name="Conversation" component={ConversationScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="FishDatabase" component={FishDatabaseScreen} />
        <Stack.Screen name="FishDetail" component={FishDetailScreen} />
        <Stack.Screen name="Articles" component={ArticlesScreen} />
        <Stack.Screen name="Tools" component={ToolsScreen} />
        <Stack.Screen name="Shops" component={ShopsScreen} />
        <Stack.Screen name="Logbook" component={LogbookScreen} />
        <Stack.Screen name="Trophies" component={TrophiesScreen} />
        <Stack.Screen name="UserGuide" component={UserGuideScreen} />
        <Stack.Screen name="FAQ" component={FAQScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
