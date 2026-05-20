import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandLogo } from '../components/brand/BrandLogo';
import { useAuthBootstrap } from '../hooks/useAuth';
import { colors, opacity, radius, spacing } from '../theme/theme';
import { RootStackParamList } from '../navigation/types';
import { AuthState } from '../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SPLASH_AUTH_TIMEOUT_MS = 2000;

const unauthenticatedState: AuthState = {
  isAuthenticated: false,
  user: null,
};

function withSplashTimeout(promise: Promise<AuthState>) {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<AuthState>((resolve) => {
    timeoutId = setTimeout(() => resolve(unauthenticatedState), SPLASH_AUTH_TIMEOUT_MS);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

export function SplashScreen({ navigation }: Props) {
  const { bootstrap } = useAuthBootstrap();

  useEffect(() => {
    let active = true;

    async function runBootstrap() {
      let state = unauthenticatedState;

      try {
        state = await withSplashTimeout(bootstrap());
      } catch {
        state = unauthenticatedState;
      }

      if (!active) {
        return;
      }

      navigation.reset({
        index: 0,
        routes: [{ name: state.isAuthenticated ? 'MainTabs' : 'Login' }],
      });
    }

    runBootstrap();

    return () => {
      active = false;
    };
  }, [bootstrap, navigation]);

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.root}
    >
      <View style={styles.logoWrap}>
        <BrandLogo color={colors.background} height={58} width={240} />
      </View>
      <View style={styles.track}>
        <View style={styles.fill} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  logoWrap: {
    marginBottom: spacing.xxxl,
  },
  track: {
    backgroundColor: opacity.surface88,
    borderRadius: radius.round,
    height: 4,
    overflow: 'hidden',
    width: 92,
  },
  fill: {
    backgroundColor: colors.background,
    borderRadius: radius.round,
    height: '100%',
    width: '72%',
  },
});
