import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandLogo } from '../components/brand/BrandLogo';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const features = [
  'Explorer les spots utiles',
  'Partager les prises',
  'Suivre ses sessions',
];

export function WelcomeScreen({ navigation }: Props) {
  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.root}
    >
      <View style={styles.hero}>
        <View style={styles.picto}>
          <BrandLogo color={colors.background} height={88} variant="picto" width={78} />
        </View>
        <BrandLogo color={colors.background} height={46} width={220} />
        <Text style={styles.title}>La pêche, simplement organisée.</Text>
        <Text style={styles.description}>
          PechoMax rassemble spots, communauté et journal de pêche dans une expérience calme et naturelle.
        </Text>
      </View>

      <Card padding="lg" style={styles.card}>
        {features.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <View style={styles.dot} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </Card>

      <View style={styles.actions}>
        <Button
          accessibilityLabel="Créer un compte"
          fullWidth
          onPress={() => navigation.navigate('Register')}
          title="Créer un compte"
          variant="earth"
        />
        <Button
          accessibilityLabel="Se connecter"
          fullWidth
          onPress={() => navigation.navigate('Login')}
          title="Se connecter"
          variant="outline"
        />
        <Button
          accessibilityLabel="Découvrir l'application"
          fullWidth
          onPress={() => navigation.navigate('Onboarding')}
          title="Découvrir l'app"
          variant="ghost"
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  picto: {
    alignItems: 'center',
    borderColor: opacity.surface88,
    borderRadius: radius.xl,
    borderWidth: 1,
    height: 118,
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    width: 118,
  },
  title: {
    color: colors.background,
    fontFamily: typography.fontFamilyBold,
    fontSize: 27,
    fontWeight: typography.weights.bold,
    lineHeight: 33,
    marginTop: spacing.xxl,
    textAlign: 'center',
  },
  description: {
    color: colors.background,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.md,
    opacity: 0.88,
    textAlign: 'center',
  },
  card: {
    backgroundColor: opacity.surface88,
    borderColor: opacity.surface88,
    marginBottom: spacing.lg,
  },
  featureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  dot: {
    backgroundColor: colors.earth,
    borderRadius: radius.round,
    height: 8,
    width: 8,
  },
  featureText: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
    fontWeight: typography.weights.bold,
  },
  actions: {
    gap: spacing.md,
  },
});
