import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import RNMapView, { MapPressEvent, Marker, Region } from 'react-native-maps';
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
import { createSpot } from '../services/spotService';
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

type SpotDraft = {
  description: string;
  name: string;
};

type SpotCoordinate = {
  latitude: number;
  longitude: number;
};

const emptySpotDraft: SpotDraft = {
  description: '',
  name: '',
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

function validCoordinate(coordinate: SpotCoordinate | null): coordinate is SpotCoordinate {
  return (
    coordinate !== null &&
    Number.isFinite(coordinate.latitude) &&
    Number.isFinite(coordinate.longitude) &&
    coordinate.latitude >= -90 &&
    coordinate.latitude <= 90 &&
    coordinate.longitude >= -180 &&
    coordinate.longitude <= 180
  );
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
  const [currentRegion, setCurrentRegion] = useState<Region>(FRANCE_REGION);
  const [placementMode, setPlacementMode] = useState(false);
  const [draftCoordinate, setDraftCoordinate] = useState<SpotCoordinate | null>(null);
  const [spotDraft, setSpotDraft] = useState<SpotDraft>(emptySpotDraft);
  const [creatingSpot, setCreatingSpot] = useState(false);
  const [spotError, setSpotError] = useState<string | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<SpotCoordinate | null>(null);
  const { error, filteredSpots, loading, refresh } = useSpots(filter, query);
  const mappableSpots = useMemo(() => filteredSpots.filter((spot) => spot.coordinates), [filteredSpots]);
  const mapRegion = useMemo(() => getRegion(mappableSpots.length > 0 ? mappableSpots : filteredSpots), [filteredSpots, mappableSpots]);
  const selectedSpot = filteredSpots.find((spot) => spot.id === selectedSpotId) ?? filteredSpots[0] ?? null;

  useEffect(() => {
    if (!userLocation && filteredSpots.length > 0) {
      mapRef.current?.animateToRegion(mapRegion, 350);
    }
  }, [filteredSpots.length, mapRegion, userLocation]);

  const recenter = () => {
    mapRef.current?.animateToRegion(
      selectedSpot?.coordinates
        ? { ...selectedSpot.coordinates, latitudeDelta: 0.08, longitudeDelta: 0.08 }
        : currentRegion,
      350,
    );
  };

  const selectSpot = (spot: FishingSpot) => {
    setSelectedSpotId(spot.id);
    if (spot.coordinates) {
      mapRef.current?.animateToRegion({ ...spot.coordinates, latitudeDelta: 0.08, longitudeDelta: 0.08 }, 350);
    }
  };

  const locateUser = async () => {
    setLocationMessage(null);

    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      setLocationMessage('Localisation refusee. La carte reste disponible.');
      return;
    }

    try {
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coordinate = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setUserLocation(coordinate);
      mapRef.current?.animateToRegion({ ...coordinate, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 350);
    } catch {
      setLocationMessage('Impossible de recuperer votre position.');
    }
  };

  const openCreateSpot = () => {
    setPlacementMode(true);
    setSpotDraft(emptySpotDraft);
    setDraftCoordinate(null);
    setSpotError(null);
  };

  const cancelPlacement = () => {
    setPlacementMode(false);
    setDraftCoordinate(null);
    setSpotDraft(emptySpotDraft);
    setSpotError(null);
  };

  const onMapPress = (event: MapPressEvent) => {
    if (!placementMode) {
      return;
    }

    const { latitude, longitude } = event.nativeEvent.coordinate;
    setDraftCoordinate({ latitude, longitude });
    setSpotError(null);
  };

  const submitSpot = async () => {
    const coordinate = draftCoordinate;

    if (!spotDraft.name.trim() || !validCoordinate(coordinate)) {
      setSpotError('Touchez la carte et renseignez un nom pour creer le spot.');
      return;
    }

    setCreatingSpot(true);
    setSpotError(null);

    try {
      const spot = await createSpot({
        description: spotDraft.description,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        name: spotDraft.name,
      });
      await refresh();
      setSelectedSpotId(spot.id);
      setPlacementMode(false);
      setDraftCoordinate(null);
      setSpotDraft(emptySpotDraft);
      if (spot.coordinates) {
        mapRef.current?.animateToRegion({ ...spot.coordinates, latitudeDelta: 0.08, longitudeDelta: 0.08 }, 350);
      }
    } catch {
      setSpotError('Impossible de creer ce spot. Verifiez la connexion et reessayez.');
    } finally {
      setCreatingSpot(false);
    }
  };

  return (
    <Screen padded={false} style={styles.root}>
      <RNMapView
        ref={mapRef}
        initialRegion={mapRegion}
        onPress={onMapPress}
        onRegionChangeComplete={setCurrentRegion}
        showsUserLocation={Boolean(userLocation)}
        style={styles.map}
      >
        {mappableSpots.map((spot) => (
          <Marker
            coordinate={spot.coordinates!}
            key={spot.id}
            onPress={() => selectSpot(spot)}
            pinColor={spot.id === selectedSpot?.id ? colors.earth : colors.primary}
            title={spot.name}
          />
        ))}
        {placementMode && draftCoordinate ? (
          <Marker
            coordinate={draftCoordinate}
            draggable
            onDragEnd={(event) => setDraftCoordinate(event.nativeEvent.coordinate)}
            pinColor={colors.secondary}
            title="Nouveau spot"
          />
        ) : null}
      </RNMapView>

      <View pointerEvents="box-none" style={styles.topOverlay}>
        <AppHeader
          action={<IconButton accessibilityLabel="Ajouter un spot" icon="add" onPress={openCreateSpot} variant="primary" />}
          subtitle={`${filteredSpots.length} spots disponibles`}
          title="Carte des spots"
        />
        <Card elevated style={styles.searchCard}>
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
          {locationMessage ? <Text style={styles.errorText}>{locationMessage}</Text> : null}
        </Card>
      </View>

      <View style={styles.mapControls}>
        <Button iconLeft="locate-outline" onPress={locateUser} size="sm" title="Me localiser" variant="secondary" />
        <IconButton accessibilityLabel="Recentrer la carte" icon="navigate-outline" onPress={recenter} variant="soft" />
      </View>

      <View pointerEvents="box-none" style={styles.bottomOverlay}>
        {placementMode ? (
          <Card elevated style={styles.placementCard}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Placer un nouveau spot</Text>
              <Pressable accessibilityRole="button" onPress={cancelPlacement} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            <Text style={styles.previewText}>
              {draftCoordinate ? 'Deplacez le repere si besoin, puis validez le spot.' : 'Touchez la carte pour placer le repere.'}
            </Text>
            <Input label="Nom du spot" onChangeText={(name) => setSpotDraft((current) => ({ ...current, name }))} value={spotDraft.name} />
            <Input
              inputStyle={styles.textArea}
              label="Description (optionnelle)"
              multiline
              onChangeText={(description) => setSpotDraft((current) => ({ ...current, description }))}
              textAlignVertical="top"
              value={spotDraft.description}
            />
            {spotError ? <Text style={styles.errorText}>{spotError}</Text> : null}
            <View style={styles.placementActions}>
              <Button onPress={cancelPlacement} title="Annuler" variant="ghost" />
              <Button disabled={!draftCoordinate || !spotDraft.name.trim()} loading={creatingSpot} onPress={submitSpot} title="Creer le spot" />
            </View>
          </Card>
        ) : selectedSpot ? (
          <Card elevated style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.fill}>
                <Text style={styles.previewTitle}>{selectedSpot.name}</Text>
                <Text style={styles.muted}>{selectedSpot.location}</Text>
              </View>
              <Badge label={selectedSpot.waterType === 'freshwater' ? 'Eau douce' : 'Mer'} tone="secondary" />
            </View>
            <Text numberOfLines={2} style={styles.previewText}>{selectedSpot.conditions || 'Informations disponibles sur la fiche du spot.'}</Text>
            <Button
              accessibilityLabel={`Ouvrir ${selectedSpot.name}`}
              onPress={() => navigation.navigate('SpotDetail', { spotId: selectedSpot.id })}
              size="sm"
              title="Voir le spot"
            />
          </Card>
        ) : !loading && !error && filteredSpots.length === 0 ? (
          <EmptyState description="Touchez le bouton + pour ajouter un spot." icon="search-outline" title="Aucun spot trouve" />
        ) : null}

        {loading ? <EmptyState description="Chargement des spots." title="Chargement" /> : null}
        {!loading && error ? (
          <EmptyState actionLabel="Reessayer" description="Impossible de charger les spots." icon="alert-circle-outline" onActionPress={refresh} title="Erreur" />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  topOverlay: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  searchCard: {
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
  },
  bottomOverlay: {
    bottom: spacing.lg,
    gap: spacing.md,
    left: spacing.lg,
    position: 'absolute',
    right: spacing.lg,
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
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapControls: {
    alignItems: 'flex-end',
    bottom: 168,
    gap: spacing.md,
    position: 'absolute',
    right: spacing.lg,
  },
  bottomSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopColor: opacity.black08,
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    left: 0,
    maxHeight: 390,
    minHeight: 230,
    position: 'absolute',
    right: 0,
  },
  sheetHandleArea: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  sheetHandle: {
    backgroundColor: opacity.black24,
    borderRadius: radius.round,
    height: 5,
    width: 54,
  },
  sheetContent: {
    gap: spacing.md,
    padding: spacing.xxl,
    paddingTop: 0,
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
  placementCard: {
    gap: spacing.md,
  },
  placementActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-end',
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
  modalBackdrop: {
    backgroundColor: opacity.black40,
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  modalCard: {
    gap: spacing.lg,
  },
  modalTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 18,
    fontWeight: typography.weights.bold,
  },
  closeButton: {
    padding: spacing.xs,
  },
  coordinateRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  coordinateInput: {
    flex: 1,
  },
  textArea: {
    minHeight: 82,
  },
  errorText: {
    color: colors.danger,
    fontFamily: typography.fontFamily,
    fontSize: 13,
  },
});
