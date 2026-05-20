import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandLogo } from '../components/brand/BrandLogo';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const steps = [
  {
    title: 'Decouvrez les meilleurs spots',
    description: "Explorez des lieux de pêche utiles, filtrés par type d'eau et enrichis par la communauté.",
  },
  {
    title: 'Rejoignez la communaute',
    description: 'Partagez vos prises, échangez des conseils et gardez le lien avec les pêcheurs autour de vous.',
  },
  {
    title: 'Enregistrez vos sessions',
    description: 'Suivez vos sorties, vos espèces favorites et vos progrès au même endroit.',
  },
];

export function OnboardingScreen({ navigation }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const next = () => {
    if (isLast) {
      navigation.navigate('Register');
      return;
    }

    setStepIndex((current) => current + 1);
  };

  return (
    <Screen padded={false}>
      <AppHeader
        action={
          <Button
            accessibilityLabel="Passer l'introduction"
            onPress={() => navigation.navigate('Login')}
            size="sm"
            title="Passer"
            variant="ghost"
          />
        }
        logo
      />

      <View style={styles.content}>
        <Card elevated padding="xxl" style={styles.card}>
          <View style={styles.picto}>
            <BrandLogo color={colors.primary} height={70} variant="picto" width={62} />
          </View>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
        </Card>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {steps.map((item, index) => (
            <View
              key={item.title}
              style={[
                styles.dot,
                index === stepIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
        <Button
          accessibilityLabel={isLast ? 'Créer un compte' : 'Continuer'}
          fullWidth
          iconRight="chevron-forward"
          onPress={next}
          title={isLast ? 'Créer un compte' : 'Suivant'}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  card: {
    alignItems: 'center',
  },
  picto: {
    alignItems: 'center',
    backgroundColor: opacity.primary10,
    borderRadius: radius.xl,
    height: 104,
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    width: 104,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 24,
    fontWeight: typography.weights.bold,
    lineHeight: 31,
    textAlign: 'center',
  },
  description: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.xxl,
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  dot: {
    borderRadius: radius.round,
    height: 8,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 32,
  },
  dotInactive: {
    backgroundColor: opacity.black16,
    width: 8,
  },
});
