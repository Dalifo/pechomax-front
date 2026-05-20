import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { RemoteImage } from '../components/ui/RemoteImage';
import { RootStackParamList } from '../navigation/types';
import { getMySpots } from '../services/spotService';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { FishingSpot } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'MySpots'>;

export function MySpotsScreen({ navigation }: Props) {
  const [spots, setSpots] = useState<FishingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMySpots();
      setSpots(data);
    } catch {
      setError('Impossible de charger vos spots.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Screen padded={false} scroll>
      <AppHeader onBack={navigation.goBack} showBack subtitle={`${spots.length} spot${spots.length !== 1 ? 's' : ''}`} title="Mes spots" />

      <View style={styles.content}>
        {loading ? (
          <EmptyState description="Chargement de vos spots." icon="location-outline" title="Chargement" />
        ) : error ? (
          <EmptyState actionLabel="Réessayer" description={error} icon="alert-circle-outline" onActionPress={load} title="Erreur" />
        ) : spots.length === 0 ? (
          <EmptyState description="Vous n'avez pas encore créé de spot. Ajoutez-en un depuis le formulaire de nouvelle prise." icon="location-outline" title="Aucun spot" />
        ) : (
          spots.map((spot) => (
            <Card key={spot.id} onPress={() => navigation.navigate('SpotDetail', { spotId: spot.id })} style={styles.spotCard}>
              <RemoteImage style={styles.spotImage} uri={spot.imageUrl}>
                <Ionicons name="location-outline" size={28} color={colors.primary} />
              </RemoteImage>
              <View style={styles.spotInfo}>
                <Text numberOfLines={1} style={styles.spotName}>{spot.name}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={13} color={colors.textMuted} />
                  <Text numberOfLines={1} style={styles.muted}>{spot.location}</Text>
                </View>
                <View style={styles.badgeRow}>
                  <Badge label={spot.waterType === 'freshwater' ? 'Eau douce' : 'Mer'} tone="secondary" />
                  {spot.rating > 0 ? <Badge label={`${spot.rating.toFixed(1)} / 5`} tone="earth" /> : null}
                  {(spot.favoritesCount ?? 0) > 0 ? <Badge label={`${spot.favoritesCount} favoris`} tone="neutral" /> : null}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSoft} />
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.xxl,
  },
  spotCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  spotImage: {
    alignItems: 'center',
    backgroundColor: opacity.primary10,
    borderRadius: radius.md,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  spotInfo: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  spotName: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.weights.bold,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
