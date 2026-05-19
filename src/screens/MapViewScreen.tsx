import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import RNMapView, { Marker, Region } from 'react-native-maps';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { Input } from '../components/ui/Input';
import { useSpots } from '../hooks/useSpots';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { EntityId, FishingSpot, WaterType } from '../types/domain';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
type FilterId = 'all' | WaterType | 'favorites';

const filters: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'freshwater', label: 'Eau douce' },
  { id: 'saltwater', label: 'Mer' },
  { id: 'favorites', label: 'Favoris' },
];

const FRANCE_REGION: Region = {
  latitude: 46.603354,
  latitudeDelta: 8,
  longitude: 1.888334,
  longitudeDelta: 8,
};

function getRegion(spots: FishingSpot[]): Region {
  const geocodedSpots = spots.filter((spot) => spot.coordinates);
  if (geocodedSpots.length === 0) {
    return FRANCE_REGION;
  }

  const latitudes = geocodedSpots.map((spot) => spot.coordinates?.latitude ?? FRANCE_REGION.latitude);
  const longitudes = geocodedSpots.map((spot) => spot.coordinates?.longitude ?? FRANCE_REGION.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    latitudeDelta: Math.max(0.08, (maxLatitude - minLatitude) * 1.8 || 0.5),
    longitude: (minLongitude + maxLongitude) / 2,
    longitudeDelta: Math.max(0.08, (maxLongitude - minLongitude) * 1.8 || 0.5),
  };
}

function NearbySpotCard({ onPress, selected, spot }: { onPress: () => void; selected: boolean; spot: FishingSpot }) {
  return (
    <Card
      accessibilityLabel={`Selectionner ${spot.name}`}
      onPress={onPress}
      padding="md"
      style={[styles.nearbyCard, selected && styles.nearbyCardSelected]}
    >
      <Ionicons name="location-outline" size={22} color={colors.primary} />
      <Text numberOfLines={2} style={styles.nearbyTitle}>{spot.name}</Text>
      <Text style={styles.muted}>{spot.location}</Text>
    </Card>
  );
}

export function MapViewScreen() {
  const navigation = useNavigation<RootNavigation>();
  const mapRef = useRef<RNMapView | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');
  const [selectedSpotId, setSelectedSpotId] = useState<EntityId | null>(null);
  const { error, filteredSpots, loading, refresh } = useSpots(filter, query);
  const mappableSpots = useMemo(() => filteredSpots.filter((spot) => spot.coordinates), [filteredSpots]);
  const mapRegion = useMemo(() => getRegion(mappableSpots.length > 0 ? mappableSpots : filteredSpots), [filteredSpots, mappableSpots]);
  const selectedSpot = filteredSpots.find((spot) => spot.id === selectedSpotId) ?? filteredSpots[0] ?? null;

  const recenter = () => {
    mapRef.current?.animateToRegion(
      selectedSpot?.coordinates
        ? { ...selectedSpot.coordinates, latitudeDelta: 0.08, longitudeDelta: 0.08 }
        : mapRegion,
      350,
    );
  };

  const selectSpot = (spot: FishingSpot) => {
    setSelectedSpotId(spot.id);
    if (spot.coordinates) {
      mapRef.current?.animateToRegion({ ...spot.coordinates, latitudeDelta: 0.08, longitudeDelta: 0.08 }, 350);
    }
  };

  return (
    <Screen padded={false} style={styles.root}>
      <AppHeader
        action={<IconButton accessibilityLabel="Recentrer la carte" icon="navigate" onPress={recenter} variant="primary" />}
        subtitle={`${filteredSpots.length} spots disponibles`}
        title="Carte des spots"
      />

      <View style={styles.searchBlock}>
        <Input
          accessibilityLabel="Rechercher un spot"
          iconLeft="search-outline"
          onChangeText={setQuery}
          placeholder="Rechercher un spot..."
          value={query}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {filters.map((item) => {
              const active = item.id === filter;
              return (
                <Pressable
                  accessibilityLabel={`Filtre ${item.label}`}
                  accessibilityRole="button"
                  key={item.id}
                  onPress={() => setFilter(item.id)}
                  style={({ pressed }) => [styles.filterChip, active && styles.filterChipActive, pressed && styles.pressed]}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View style={styles.mapArea}>
        <RNMapView ref={mapRef} initialRegion={mapRegion} style={styles.map}>
          {mappableSpots.map((spot) => (
            <Marker
              coordinate={spot.coordinates!}
              key={spot.id}
              onPress={() => selectSpot(spot)}
              title={spot.name}
            >
              <View style={[styles.marker, spot.id === selectedSpot?.id && styles.markerSelected]}>
                <Ionicons name="fish-outline" size={18} color={colors.background} />
              </View>
            </Marker>
          ))}
        </RNMapView>

        <View style={styles.mapControls}>
          <IconButton accessibilityLabel="Recentrer la carte" icon="navigate-outline" onPress={recenter} variant="soft" />
        </View>
      </View>

      <View style={styles.bottomPanel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Spots a proximite</Text>
          <Text style={styles.muted}>{filteredSpots.length} resultats</Text>
        </View>

        {loading ? <EmptyState description="Chargement des spots." title="Chargement" /> : null}

        {!loading && error ? (
          <EmptyState actionLabel="Reessayer" description="Impossible de charger les spots." icon="alert-circle-outline" onActionPress={refresh} title="Erreur" />
        ) : null}

        {!loading && !error && filteredSpots.length === 0 ? (
          <EmptyState description="Essayez une autre recherche." icon="search-outline" title="Aucun spot trouve" />
        ) : null}

        {!loading && !error && filteredSpots.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.nearbyList}>
              {filteredSpots.map((spot) => (
                <NearbySpotCard
                  key={spot.id}
                  onPress={() => selectSpot(spot)}
                  selected={spot.id === selectedSpot?.id}
                  spot={spot}
                />
              ))}
            </View>
          </ScrollView>
        ) : null}

        {selectedSpot ? (
          <Card elevated style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.fill}>
                <Text style={styles.previewTitle}>{selectedSpot.name}</Text>
                <Text style={styles.muted}>{selectedSpot.location}</Text>
              </View>
              <Badge label={selectedSpot.waterType === 'freshwater' ? 'Eau douce' : 'Mer'} tone="secondary" />
            </View>
            <Text style={styles.previewText}>{selectedSpot.conditions || 'Informations disponibles sur la fiche du spot.'}</Text>
            <View style={styles.previewMeta}>
              <Text style={styles.metaStrong}>{selectedSpot.rating.toFixed(1)} / 5</Text>
              <Text style={styles.muted}>{selectedSpot.fish.length > 0 ? selectedSpot.fish.join(', ') : 'Especes a confirmer'}</Text>
            </View>
            <Button
              accessibilityLabel={`Ouvrir ${selectedSpot.name}`}
              onPress={() => navigation.navigate('SpotDetail', { spotId: selectedSpot.id })}
              title="Voir le spot"
            />
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
  },
  searchBlock: {
    gap: spacing.md,
    padding: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    backgroundColor: opacity.black06,
    borderRadius: radius.md,
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
  mapArea: {
    backgroundColor: opacity.secondary10,
    flex: 1,
    minHeight: 280,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    height: '100%',
    width: '100%',
  },
  marker: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.background,
    borderRadius: radius.round,
    borderWidth: 2,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  markerSelected: {
    backgroundColor: colors.earth,
  },
  mapControls: {
    bottom: spacing.lg,
    gap: spacing.md,
    position: 'absolute',
    right: spacing.lg,
  },
  bottomPanel: {
    backgroundColor: colors.background,
    borderTopColor: opacity.black08,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
    padding: spacing.xxl,
  },
  panelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  panelTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.weights.bold,
  },
  nearbyList: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  nearbyCard: {
    gap: spacing.sm,
    minHeight: 112,
    width: 144,
  },
  nearbyCardSelected: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  nearbyTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  previewCard: {
    gap: spacing.md,
  },
  previewHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  previewTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 17,
    fontWeight: typography.weights.bold,
  },
  previewText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  previewMeta: {
    gap: spacing.xs,
  },
  metaStrong: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  fill: {
    flex: 1,
    minWidth: 0,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.72,
  },
});

