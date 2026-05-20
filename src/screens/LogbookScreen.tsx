import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { RemoteImage } from '../components/ui/RemoteImage';
import { useLogbook } from '../hooks/useLogbook';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { LogbookCatch } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'Logbook'>;
type LogbookView = 'list' | 'stats' | 'add';

const speciesFilters = ['Tous', 'Brochet', 'Sandre', 'Carpe', 'Perche'];

export function LogbookScreen({ navigation }: Props) {
  const [view, setView] = useState<LogbookView>('list');
  const [species, setSpecies] = useState('Tous');
  const { filteredCatches, loading, stats } = useLogbook(species);
  const visibleCatches = filteredCatches;

  return (
    <Screen padded={false} scroll>
      <AppHeader
        action={<Button iconLeft="add" onPress={() => navigation.navigate('CreatePost')} size="sm" title="Ajouter" />}
        onBack={navigation.goBack}
        showBack
        subtitle="Suivi de vos captures"
        title="Journal de bord"
      />

      <View style={styles.content}>
        <View style={styles.segment}>
          <ModeButton active={view === 'list'} label="Liste" onPress={() => setView('list')} />
          <ModeButton active={view === 'stats'} label="Stats" onPress={() => setView('stats')} />
          <ModeButton active={view === 'add'} label="Ajouter" onPress={() => navigation.navigate('CreatePost')} />
        </View>

        {view === 'list' ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                {speciesFilters.map((item) => (
                  <Pressable key={item} onPress={() => setSpecies(item)} style={[styles.filterChip, item === species && styles.filterChipActive]}>
                    <Text style={[styles.filterText, item === species && styles.filterTextActive]}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            {loading ? <EmptyState description="Chargement du journal." icon="book-outline" title="Chargement" /> : null}
            {!loading && visibleCatches.map((catchItem) => (
              <CatchCard catchItem={catchItem} key={catchItem.id} />
            ))}
          </>
        ) : null}

        {view === 'stats' ? (
          <>
            <View style={styles.statsGrid}>
              <StatCard icon="fish-outline" label="Captures" value={String(stats.total)} />
              <StatCard icon="scale-outline" label="Moyenne" value={`${stats.averageWeight.toFixed(1)} kg`} />
            </View>
            {stats.biggest ? (
              <Card style={styles.featureCard}>
                <Text style={styles.featureKicker}>Plus belle prise</Text>
                <Text style={styles.featureTitle}>{stats.biggest.species}</Text>
                <Text style={styles.bodyText}>{stats.biggest.weight} kg - {stats.biggest.length} cm</Text>
                <Text style={styles.muted}>{stats.biggest.location}</Text>
              </Card>
            ) : null}
            <Card>
              <Text style={styles.cardTitle}>Tendances</Text>
              <Text style={styles.bodyText}>Les statistiques se mettent a jour avec vos prises enregistrees.</Text>
            </Card>
          </>
        ) : null}

        {view === 'add' ? (
          <>
            <Card style={styles.photoCard}>
              <Ionicons name="fish-outline" size={46} color={colors.textMuted} />
              <Text style={styles.title}>Nouvelle prise</Text>
              <Text style={styles.muted}>Ajoutez votre prise depuis le formulaire de publication.</Text>
            </Card>
            <Button onPress={() => navigation.navigate('CreatePost')} title="Ajouter une prise" />
          </>
        ) : null}
      </View>
    </Screen>
  );
}

function ModeButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.segmentButton, active && styles.segmentButtonActive]}>
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

function StatCard({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <Card padding="md" style={styles.statCard}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.muted}>{label}</Text>
    </Card>
  );
}

function CatchCard({ catchItem }: { catchItem: LogbookCatch }) {
  return (
    <Card style={styles.catchCard}>
      <RemoteImage style={styles.catchIcon} uri={catchItem.imageUrl}>
        <Ionicons name="fish-outline" size={28} color={colors.primary} />
      </RemoteImage>
      <View style={styles.textFill}>
        <View style={styles.rowBetween}>
          <Text style={styles.title}>{catchItem.species}</Text>
          <Text style={styles.muted}>{catchItem.date}</Text>
        </View>
        <View style={styles.badgeRow}>
          <Badge label={`${catchItem.length} cm`} tone="secondary" />
          <Badge label={`${catchItem.weight} kg`} tone="earth" />
        </View>
        <Text style={styles.muted}>{catchItem.location}</Text>
        <Text style={styles.bodyText}>{catchItem.technique} - {catchItem.time}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  segment: {
    backgroundColor: opacity.black06,
    borderRadius: radius.md,
    flexDirection: 'row',
    padding: 3,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  segmentButtonActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  segmentTextActive: {
    color: colors.background,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    backgroundColor: opacity.black06,
    borderRadius: radius.round,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.secondary,
  },
  filterText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
  },
  filterTextActive: {
    color: colors.background,
  },
  catchCard: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  catchIcon: {
    alignItems: 'center',
    backgroundColor: opacity.primary10,
    borderRadius: radius.lg,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  textFill: {
    flex: 1,
    minWidth: 0,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 16,
    fontWeight: typography.weights.bold,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  bodyText: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    gap: spacing.xs,
  },
  statValue: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 22,
    fontWeight: typography.weights.bold,
  },
  featureCard: {
    backgroundColor: opacity.earth10,
  },
  featureKicker: {
    color: colors.earth,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  featureTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 24,
    fontWeight: typography.weights.bold,
    marginVertical: spacing.sm,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  photoCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  formCard: {
    gap: spacing.lg,
  },
});
