import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, StyleSheet } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { SectionTitle } from '../components/ui/SectionTitle';
import { useFishDetail } from '../hooks/useFish';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, spacing, typography } from '../theme/theme';
import { WaterType } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'FishDetail'>;

function waterTypeLabel(type: WaterType) {
  if (type === 'saltwater') {
    return 'Mer';
  }

  if (type === 'mixed') {
    return 'Mixte';
  }

  return 'Eau douce';
}

export function FishDetailScreen({ navigation, route }: Props) {
  const { data: fish, loading } = useFishDetail(route.params.fishId);

  if (loading || !fish) {
    return (
      <Screen padded={false}>
        <AppHeader onBack={navigation.goBack} showBack title="Fiche poisson" />
        <EmptyState description="Chargement de la fiche." icon="fish-outline" title="Chargement" />
      </Screen>
    );
  }

  return (
    <Screen padded={false} scroll>
      <AppHeader onBack={navigation.goBack} showBack title="Fiche poisson" />
      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.hero}>
        <Ionicons name={fish.type === 'freshwater' ? 'fish-outline' : 'boat-outline'} size={70} color={colors.background} />
        <Badge label={waterTypeLabel(fish.type)} tone="neutral" style={styles.heroBadge} />
        <Text style={styles.heroTitle}>{fish.name}</Text>
        <Text style={styles.heroSubtitle}>{fish.scientificName}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.quickGrid}>
          <Card padding="md" style={styles.quickCard}>
            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
            <Text style={styles.quickLabel}>Saison</Text>
            <Text style={styles.quickValue}>{fish.season}</Text>
          </Card>
          <Card padding="md" style={styles.quickCard}>
            <Ionicons name="speedometer-outline" size={22} color={colors.secondary} />
            <Text style={styles.quickLabel}>Difficulté</Text>
            <Text style={styles.quickValue}>{fish.difficulty ?? 'À évaluer'}</Text>
          </Card>
        </View>

        <InfoSection icon="information-circle-outline" title="Description" text={fish.description} />
        <InfoSection icon="location-outline" title="Habitat" text={fish.habitat} />
        <InfoSection icon="resize-outline" title="Taille et poids moyens" text={[fish.averageSize, fish.averageWeight].filter(Boolean).join(' - ')} />

        <SectionTitle icon="radio-button-on-outline" title="Techniques de pêche" />
        <View style={styles.badgeRow}>
          {fish.techniques.map((technique) => (
            <Badge key={technique} label={technique} tone="primary" />
          ))}
        </View>

        <Card style={styles.regulationCard}>
          <SectionTitle icon="shield-checkmark-outline" title="Protection" />
          <Text style={styles.bodyText}>{fish.protectionStatus}</Text>
        </Card>

        <Card style={styles.regulationCard}>
          <SectionTitle icon="ribbon-outline" title="Réglementation" />
          <Text style={styles.bodyText}>{fish.regulation}</Text>
        </Card>
      </View>
    </Screen>
  );
}

function InfoSection({ icon, text, title }: { icon: keyof typeof Ionicons.glyphMap; text: string; title: string }) {
  return (
    <Card>
      <SectionTitle icon={icon} title={title} />
      <Text style={styles.bodyText}>{text}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xxxl,
  },
  heroBadge: {
    backgroundColor: opacity.surface88,
  },
  heroTitle: {
    color: colors.background,
    fontFamily: typography.fontFamilyBold,
    fontSize: 30,
    fontWeight: typography.weights.bold,
  },
  heroSubtitle: {
    color: opacity.surface88,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontStyle: 'italic',
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickCard: {
    flex: 1,
    gap: spacing.xs,
  },
  quickLabel: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  quickValue: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  bodyText: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 21,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  regulationCard: {
    backgroundColor: opacity.earth10,
  },
});
