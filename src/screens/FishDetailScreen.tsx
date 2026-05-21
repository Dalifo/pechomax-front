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
import { colors, opacity, radius, shadows, spacing, typography } from '../theme/theme';
import { WaterType } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'FishDetail'>;

function waterTypeLabel(type: WaterType) {
  if (type === 'saltwater') return 'Mer';
  if (type === 'mixed') return 'Mixte';
  return 'Eau douce';
}

function fishIcon(type: WaterType) {
  if (type === 'saltwater') return 'boat-outline';
  if (type === 'mixed') return 'swap-horizontal-outline';
  return 'fish-outline';
}

export function FishDetailScreen({ navigation, route }: Props) {
  const { data: fish, error, loading, refresh } = useFishDetail(route.params.fishId);

  if (loading || !fish) {
    return (
      <Screen padded={false}>
        <AppHeader onBack={navigation.goBack} showBack title="Fishidex" />
        <View style={styles.loadingWrap}>
          <EmptyState
            actionLabel={error ? 'Réessayer' : undefined}
            description={error ?? 'Chargement de la fiche.'}
            icon={error ? 'alert-circle-outline' : 'fish-outline'}
            onActionPress={error ? refresh : undefined}
            title={error ? 'Fiche indisponible' : 'Chargement'}
          />
        </View>
      </Screen>
    );
  }

  const averageText = [fish.averageSize, fish.averageWeight].filter(Boolean).join(' / ') || 'Variable selon le milieu';
  const spotsText = fish.knownSpots.length > 0 ? fish.knownSpots.join(', ') : 'Aucun spot PechoMax associé pour le moment.';
  const difficulty = fish.difficulty?.trim();

  return (
    <Screen padded={false} scroll>
      <AppHeader onBack={navigation.goBack} showBack title="Fishidex" />
      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}>
            <Ionicons name={fishIcon(fish.type)} size={44} color={colors.background} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroKicker}>Fiche espèce</Text>
            <Text numberOfLines={2} style={styles.heroTitle}>{fish.name}</Text>
            <Text numberOfLines={1} style={styles.heroSubtitle}>{fish.scientificName}</Text>
          </View>
        </View>
        <View style={styles.heroBadges}>
          <Badge label={waterTypeLabel(fish.type)} tone="neutral" style={styles.heroBadge} />
          {difficulty ? <Badge label={difficulty} tone="neutral" style={styles.heroBadge} /> : null}
          {fish.pointValue > 0 ? <Badge label={`${fish.pointValue} points`} tone="neutral" style={styles.heroBadge} /> : null}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.quickGrid}>
          <QuickInfo icon="calendar-outline" label="Saison" value={fish.season} />
          <QuickInfo icon="resize-outline" label="Taille / poids" value={averageText} />
          {difficulty ? <QuickInfo icon="speedometer-outline" label="Difficulté" value={difficulty} /> : null}
          <QuickInfo icon="location-outline" label="Spots connus" value={String(fish.knownSpots.length)} />
        </View>

        <InfoSection icon="information-circle-outline" title="Description" text={fish.description} />
        <InfoSection icon="location-outline" title="Habitat" text={fish.habitat} />

        <Card style={styles.panel}>
          <SectionTitle icon="radio-button-on-outline" title="Techniques de pêche" />
          <View style={styles.badgeRow}>
            {fish.techniques.map((technique) => (
              <Badge key={technique} label={technique} tone="primary" />
            ))}
          </View>
        </Card>

        <Card style={styles.panel}>
          <SectionTitle icon="map-outline" title="Présence dans PechoMax" subtitle={`${fish.knownSpots.length} spot(s) associé(s)`} />
          <Text style={styles.bodyText}>{spotsText}</Text>
        </Card>

        <Card style={styles.identityCard}>
          <SectionTitle icon="document-text-outline" title="Identité Fishidex" />
          <InfoRow label="Nom commun" value={fish.name} />
          <InfoRow label="Nom scientifique" value={fish.scientificName} />
          <InfoRow label="Milieu" value={waterTypeLabel(fish.type)} />
          <InfoRow label="Valeur" value={fish.pointValue > 0 ? `${fish.pointValue} points` : 'Non renseignée'} />
        </Card>

        <Card style={styles.protectionCard}>
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

function QuickInfo({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <Card padding="md" style={styles.quickCard}>
      <Ionicons name={icon} size={21} color={colors.primary} />
      <Text style={styles.quickLabel}>{label}</Text>
      <Text numberOfLines={3} style={styles.quickValue}>{value}</Text>
    </Card>
  );
}

function InfoSection({ icon, text, title }: { icon: keyof typeof Ionicons.glyphMap; text: string; title: string }) {
  return (
    <Card style={styles.panel}>
      <SectionTitle icon={icon} title={title} />
      <Text style={styles.bodyText}>{text}</Text>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  hero: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.lg,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: opacity.black16,
    borderRadius: radius.xl,
    height: 84,
    justifyContent: 'center',
    width: 84,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  heroKicker: {
    color: opacity.surface88,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.background,
    fontFamily: typography.fontFamilyBold,
    fontSize: 30,
    fontWeight: typography.weights.bold,
    marginTop: spacing.xs,
  },
  heroSubtitle: {
    color: opacity.surface88,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  heroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  heroBadge: {
    backgroundColor: opacity.surface88,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickCard: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 118,
    ...shadows.soft,
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
    lineHeight: 18,
  },
  panel: {
    gap: spacing.sm,
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
  identityCard: {
    gap: spacing.sm,
  },
  infoRow: {
    alignItems: 'flex-start',
    borderTopColor: opacity.black08,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  infoLabel: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    width: 112,
  },
  infoValue: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
    minWidth: 0,
    textAlign: 'right',
  },
  protectionCard: {
    backgroundColor: opacity.primary10,
  },
  regulationCard: {
    backgroundColor: opacity.earth10,
  },
});
