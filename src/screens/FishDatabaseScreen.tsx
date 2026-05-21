import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Badge, BadgeTone } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { useFish } from '../hooks/useFish';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, shadows, spacing, typography } from '../theme/theme';
import { FishSpecies, WaterType } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'FishDatabase'>;
type FishFilter = 'all' | WaterType;

const filters: { id: FishFilter; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'all', label: 'Toutes', icon: 'albums-outline' },
  { id: 'freshwater', label: 'Eau douce', icon: 'water-outline' },
  { id: 'saltwater', label: 'Mer', icon: 'boat-outline' },
  { id: 'mixed', label: 'Mixte', icon: 'swap-horizontal-outline' },
];

function waterTypeLabel(type: WaterType) {
  if (type === 'saltwater') return 'Mer';
  if (type === 'mixed') return 'Mixte';
  return 'Eau douce';
}

function waterTone(type: WaterType): BadgeTone {
  if (type === 'saltwater') return 'secondary';
  if (type === 'mixed') return 'earth';
  return 'primary';
}

function fishIcon(type: WaterType) {
  if (type === 'saltwater') return 'boat-outline';
  if (type === 'mixed') return 'swap-horizontal-outline';
  return 'fish-outline';
}

export function FishDatabaseScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FishFilter>('all');
  const { data, error, filteredFish, loading, refresh } = useFish(filter, query);

  const stats = useMemo(() => {
    const freshwater = data.filter((fish) => fish.type === 'freshwater' || fish.type === 'mixed').length;
    const saltwater = data.filter((fish) => fish.type === 'saltwater' || fish.type === 'mixed').length;
    const knownSpots = data.reduce((total, fish) => total + fish.knownSpots.length, 0);
    return { freshwater, knownSpots, saltwater, total: data.length };
  }, [data]);

  return (
    <Screen padded={false} scroll>
      <AppHeader onBack={navigation.goBack} showBack subtitle={`${filteredFish.length} espèces visibles`} title="Fishidex" />
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="fish-outline" size={34} color={colors.background} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Espèces de la base PechoMax</Text>
            <Text style={styles.heroBody}>
              Fiches poissons avec habitat, saison, techniques, réglementation, difficulté et spots connus.
            </Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <DexStat icon="albums-outline" label="Espèces" value={String(stats.total)} />
          <DexStat icon="water-outline" label="Eau douce" value={String(stats.freshwater)} />
          <DexStat icon="boat-outline" label="Mer" value={String(stats.saltwater)} />
          <DexStat icon="location-outline" label="Spots" value={String(stats.knownSpots)} />
        </View>

        <Input iconLeft="search-outline" onChangeText={setQuery} placeholder="Nom, habitat, technique, spot..." value={query} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {filters.map((item) => {
              const active = item.id === filter;
              return (
                <Pressable
                  accessibilityRole="button"
                  key={item.id}
                  onPress={() => setFilter(item.id)}
                  style={({ pressed }) => [styles.filterChip, active && styles.filterChipActive, pressed && styles.pressed]}
                >
                  <Ionicons name={item.icon} size={15} color={active ? colors.background : colors.textMuted} />
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {loading ? <EmptyState description="Chargement des espèces." icon="fish-outline" title="Chargement" /> : null}
        {!loading && error ? (
          <EmptyState actionLabel="Réessayer" description={error} icon="alert-circle-outline" onActionPress={refresh} title="Fishidex indisponible" />
        ) : null}
        {!loading && !error && filteredFish.length === 0 ? (
          <EmptyState description="Essayez un autre filtre ou une autre recherche." icon="search-outline" title="Aucune espèce" />
        ) : null}
        {!loading && !error && filteredFish.map((fish, index) => (
          <FishCard
            fish={fish}
            index={index + 1}
            key={fish.id}
            onPress={() => navigation.navigate('FishDetail', { fishId: fish.id })}
          />
        ))}
      </View>
    </Screen>
  );
}

function DexStat({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.dexStat}>
      <Ionicons name={icon} size={17} color={colors.primary} />
      <Text style={styles.dexStatValue}>{value}</Text>
      <Text numberOfLines={1} style={styles.dexStatLabel}>{label}</Text>
    </View>
  );
}

function FishCard({ fish, index, onPress }: { fish: FishSpecies; index: number; onPress: () => void }) {
  const primaryTechnique = fish.techniques[0] ?? 'Technique locale';

  return (
    <Card accessibilityLabel={`Ouvrir ${fish.name}`} elevated onPress={onPress} style={styles.fishCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.fishIcon, fish.type === 'saltwater' && styles.fishIconSea, fish.type === 'mixed' && styles.fishIconMixed]}>
          <Ionicons name={fishIcon(fish.type)} size={28} color={colors.background} />
        </View>
        <View style={styles.textFill}>
          <View style={styles.nameRow}>
            <Text style={styles.dexNumber}>#{String(index).padStart(3, '0')}</Text>
            <Text numberOfLines={1} style={styles.title}>{fish.name}</Text>
          </View>
          <Text numberOfLines={1} style={styles.italic}>{fish.scientificName}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSoft} />
      </View>

      <Text numberOfLines={2} style={styles.description}>{fish.description}</Text>

      <View style={styles.badgeRow}>
        <Badge label={waterTypeLabel(fish.type)} tone={waterTone(fish.type)} />
        {fish.difficulty ? <Badge label={fish.difficulty} tone="neutral" /> : null}
        {fish.pointValue > 0 ? <Badge label={`${fish.pointValue} pts`} tone="earth" /> : null}
      </View>

      <View style={styles.factGrid}>
        <Fact icon="calendar-outline" label="Saison" value={fish.season} />
        <Fact icon="construct-outline" label="Technique" value={primaryTechnique} />
        <Fact icon="resize-outline" label="Taille" value={fish.averageSize ?? 'Variable'} />
        <Fact icon="location-outline" label="Spots" value={fish.knownSpots.length > 0 ? String(fish.knownSpots.length) : 'Aucun'} />
      </View>
    </Card>
  );
}

function Fact({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} size={15} color={colors.secondary} />
      <View style={styles.factText}>
        <Text style={styles.factLabel}>{label}</Text>
        <Text numberOfLines={2} style={styles.factValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    flexDirection: 'row',
    gap: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.soft,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: opacity.black16,
    borderRadius: radius.round,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  heroTitle: {
    color: colors.background,
    fontFamily: typography.fontFamilyBold,
    fontSize: 19,
    fontWeight: typography.weights.bold,
  },
  heroBody: {
    color: opacity.surface88,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dexStat: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: opacity.black08,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 82,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  dexStatValue: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 18,
    fontWeight: typography.weights.bold,
    marginTop: spacing.xs,
  },
  dexStatLabel: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 10,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: opacity.black06,
    borderRadius: radius.round,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 38,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  filterTextActive: {
    color: colors.background,
  },
  pressed: {
    opacity: 0.72,
  },
  fishCard: {
    gap: spacing.md,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  fishIcon: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  fishIconSea: {
    backgroundColor: colors.secondary,
  },
  fishIconMixed: {
    backgroundColor: colors.earth,
  },
  textFill: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dexNumber: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  title: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 17,
    fontWeight: typography.weights.bold,
  },
  italic: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  description: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  factGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  fact: {
    alignItems: 'flex-start',
    backgroundColor: opacity.black04,
    borderRadius: radius.md,
    flexBasis: '48%',
    flexDirection: 'row',
    flexGrow: 1,
    gap: spacing.sm,
    minHeight: 58,
    padding: spacing.sm,
  },
  factText: {
    flex: 1,
    minWidth: 0,
  },
  factLabel: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 11,
  },
  factValue: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
    lineHeight: 16,
    marginTop: 2,
  },
});
