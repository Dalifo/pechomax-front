import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { useFish } from '../hooks/useFish';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { FishSpecies, WaterType } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'FishDatabase'>;
type FishFilter = 'all' | WaterType;

const filters: { id: FishFilter; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'all', label: 'Tous', icon: 'list-outline' },
  { id: 'freshwater', label: 'Eau douce', icon: 'water-outline' },
  { id: 'saltwater', label: 'Mer', icon: 'boat-outline' },
];

function waterTypeLabel(type: WaterType) {
  if (type === 'saltwater') {
    return 'Mer';
  }

  if (type === 'mixed') {
    return 'Mixte';
  }

  return 'Eau douce';
}

export function FishDatabaseScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FishFilter>('all');
  const { filteredFish, loading } = useFish(filter, query);

  return (
    <Screen padded={false} scroll>
      <AppHeader onBack={navigation.goBack} showBack subtitle={`${filteredFish.length} espèces disponibles`} title="Base de poissons" />
      <View style={styles.content}>
        <Input iconLeft="search-outline" onChangeText={setQuery} placeholder="Rechercher un poisson..." value={query} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {filters.map((item) => {
              const active = item.id === filter;
              return (
                <Pressable
                  accessibilityRole="button"
                  key={item.id}
                  onPress={() => setFilter(item.id)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Ionicons name={item.icon} size={14} color={active ? colors.background : colors.textMuted} />
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {loading ? <EmptyState description="Chargement des espèces." icon="fish-outline" title="Chargement" /> : null}
        {!loading && filteredFish.length === 0 ? (
          <EmptyState description="Essayez une autre recherche." icon="search-outline" title="Aucun poisson trouvé" />
        ) : null}
        {!loading && filteredFish.map((fish) => (
          <FishCard fish={fish} key={fish.id} onPress={() => navigation.navigate('FishDetail', { fishId: fish.id })} />
        ))}
      </View>
    </Screen>
  );
}

function FishCard({ fish, onPress }: { fish: FishSpecies; onPress: () => void }) {
  return (
    <Card accessibilityLabel={`Ouvrir ${fish.name}`} onPress={onPress} style={styles.fishCard}>
      <View style={styles.fishIcon}>
        <Ionicons name="fish-outline" size={30} color={colors.primary} />
      </View>
      <View style={styles.textFill}>
        <Text style={styles.title}>{fish.name}</Text>
        <Text style={styles.italic}>{fish.scientificName}</Text>
        <View style={styles.badgeRow}>
          <Badge label={waterTypeLabel(fish.type)} tone="secondary" />
          {fish.difficulty ? <Badge label={fish.difficulty} tone="neutral" /> : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSoft} />
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: opacity.black06,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xs,
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
  fishCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  fishIcon: {
    alignItems: 'center',
    backgroundColor: opacity.primary10,
    borderRadius: radius.lg,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  textFill: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 16,
    fontWeight: typography.weights.bold,
  },
  italic: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
