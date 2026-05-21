import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { getFishSpecies } from '../services/fishService';
import { createSpot, favoriteSpot, unfavoriteSpot } from '../services/spotService';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { EntityId, FishSpecies, FishingSpot, WaterType } from '../types/domain';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
type FilterId = 'all' | WaterType;

const filters: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'freshwater', label: 'Eau douce' },
  { id: 'saltwater', label: 'Mer' },
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
  photo: SelectedPhoto | null;
  speciesIds: EntityId[];
  waterType: WaterType;
};

type SelectedPhoto = {
  fileName?: string;
  mimeType?: string;
  uri: string;
};

type SpotCoordinate = {
  latitude: number;
  longitude: number;
};

const emptySpotDraft: SpotDraft = {
  description: '',
  name: '',
  photo: null,
  speciesIds: [],
  waterType: 'freshwater',
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

function markerColor(spot: FishingSpot) {
  return spot.waterType === 'saltwater' ? colors.secondary : colors.primary;
}

function normalizeSpeciesName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function MapViewScreen() {
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<RouteProp<{ Map: { spotId?: string } | undefined }, 'Map'>>();
  const focusSpotId = route.params?.spotId ?? null;
  const mapRef = useRef<RNMapView | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');
  const [speciesFilterId, setSpeciesFilterId] = useState<EntityId | 'all'>('all');
  const [selectedSpotId, setSelectedSpotId] = useState<EntityId | null>(null);
  const [currentRegion, setCurrentRegion] = useState<Region>(FRANCE_REGION);
  const [placementMode, setPlacementMode] = useState(false);
  const [spotFormVisible, setSpotFormVisible] = useState(false);
  const [draftCoordinate, setDraftCoordinate] = useState<SpotCoordinate | null>(null);
  const [spotDraft, setSpotDraft] = useState<SpotDraft>(emptySpotDraft);
  const [creatingSpot, setCreatingSpot] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [species, setSpecies] = useState<FishSpecies[]>([]);
  const [spotError, setSpotError] = useState<string | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<SpotCoordinate | null>(null);
  const { error, filteredSpots, loading, refresh } = useSpots(filter, query);
  const selectedSpecies = speciesFilterId === 'all' ? null : species.find((item) => item.id === speciesFilterId) ?? null;
  const visibleSpots = useMemo(() => {
    if (!selectedSpecies) {
      return filteredSpots;
    }

    const speciesName = normalizeSpeciesName(selectedSpecies.name);
    return filteredSpots.filter((spot) => spot.fish.some((fishName) => normalizeSpeciesName(fishName) === speciesName));
  }, [filteredSpots, selectedSpecies]);
  const mappableSpots = useMemo(() => visibleSpots.filter((spot) => spot.coordinates), [visibleSpots]);
  const mapRegion = useMemo(() => getRegion(mappableSpots.length > 0 ? mappableSpots : visibleSpots), [mappableSpots, visibleSpots]);
  const selectedSpot = visibleSpots.find((spot) => spot.id === selectedSpotId) ?? null;
  const hasBottomPanel = placementMode || Boolean(selectedSpot) || loading || Boolean(error) || (!loading && !error && visibleSpots.length === 0);

  useEffect(() => {
    if (!userLocation && visibleSpots.length > 0) {
      mapRef.current?.animateToRegion(mapRegion, 350);
    }
  }, [mapRegion, userLocation, visibleSpots.length]);

  useEffect(() => {
    if (selectedSpotId && !visibleSpots.some((spot) => spot.id === selectedSpotId)) {
      setSelectedSpotId(null);
    }
  }, [selectedSpotId, visibleSpots]);

  useEffect(() => {
    if (!focusSpotId || filteredSpots.length === 0) return;
    const spot = filteredSpots.find((s) => s.id === focusSpotId);
    if (spot) selectSpot(spot);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSpotId, filteredSpots.length]);

  useEffect(() => {
    let active = true;

    getFishSpecies()
      .then((nextSpecies) => {
        if (active) {
          setSpecies(nextSpecies);
        }
      })
      .catch(() => {
        if (active) {
          setSpecies([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

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
      setLocationMessage('Localisation refusée. La carte reste disponible.');
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
      setLocationMessage('Impossible de récupérer votre position.');
    }
  };

  const openCreateSpot = () => {
    setPlacementMode(true);
    setSpotFormVisible(false);
    setSpotDraft(emptySpotDraft);
    setDraftCoordinate(null);
    setSpotError(null);
    setSelectedSpotId(null);
  };

  const cancelPlacement = () => {
    setPlacementMode(false);
    setSpotFormVisible(false);
    setDraftCoordinate(null);
    setSpotDraft(emptySpotDraft);
    setSpotError(null);
  };

  const isSpotDirty = draftCoordinate !== null || spotDraft.name.trim().length > 0 || spotDraft.description.trim().length > 0 || spotDraft.photo !== null;

  const confirmCancelPlacement = () => {
    if (!isSpotDirty) { cancelPlacement(); return; }
    Alert.alert(
      "Annuler le spot ?",
      "Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.",
      [
        { style: 'cancel', text: 'Continuer' },
        { onPress: cancelPlacement, style: 'destructive', text: 'Annuler quand même' },
      ],
    );
  };

  const confirmPlacement = () => {
    if (!validCoordinate(draftCoordinate)) {
      setSpotError('Touchez la carte pour placer le repère.');
      return;
    }

    setSpotError(null);
    setSpotFormVisible(true);
  };

  const onMapPress = (event: MapPressEvent) => {
    if (!placementMode) {
      setSelectedSpotId(null);
      return;
    }

    const { latitude, longitude } = event.nativeEvent.coordinate;
    setDraftCoordinate({ latitude, longitude });
    setSpotError(null);
  };

  const pickSpotPhoto = async () => {
    setSpotError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setSpotError("Autorisez l'accès aux photos pour ajouter une image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    setSpotDraft((current) => ({
      ...current,
      photo: {
        fileName: asset.fileName ?? 'spot.jpg',
        mimeType: asset.mimeType ?? 'image/jpeg',
        uri: asset.uri,
      },
    }));
  };

  const toggleDraftSpecies = (speciesId: EntityId) => {
    setSpotDraft((current) => ({
      ...current,
      speciesIds: current.speciesIds.includes(speciesId)
        ? current.speciesIds.filter((id) => id !== speciesId)
        : [...current.speciesIds, speciesId],
    }));
  };

  const toggleFavorite = async () => {
    if (!selectedSpot || favoriteLoading) {
      return;
    }

    setFavoriteLoading(true);
    setSpotError(null);

    try {
      if (selectedSpot.favorite) {
        await unfavoriteSpot(selectedSpot.id);
      } else {
        await favoriteSpot(selectedSpot.id);
      }

      await refresh();
    } catch {
      setSpotError('Impossible de modifier ce favori pour le moment.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const submitSpot = async () => {
    const coordinate = draftCoordinate;

    if (!spotDraft.name.trim() || !validCoordinate(coordinate)) {
      setSpotError('Touchez la carte et renseignez un nom pour créer le spot.');
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
        photoName: spotDraft.photo?.fileName,
        photoType: spotDraft.photo?.mimeType,
        photoUri: spotDraft.photo?.uri,
        speciesIds: spotDraft.speciesIds,
        waterType: spotDraft.waterType,
      });
      await refresh();
      setSelectedSpotId(spot.id);
      setPlacementMode(false);
      setSpotFormVisible(false);
      setDraftCoordinate(null);
      setSpotDraft(emptySpotDraft);
      if (spot.coordinates) {
        mapRef.current?.animateToRegion({ ...spot.coordinates, latitudeDelta: 0.08, longitudeDelta: 0.08 }, 350);
      }
    } catch {
      setSpotError('Impossible de créer ce spot. Vérifiez la connexion et réessayez.');
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
        showsMyLocationButton={false}
        showsUserLocation={Boolean(userLocation)}
        style={styles.map}
      >
        {mappableSpots.map((spot) => (
          <Marker
            coordinate={spot.coordinates!}
            key={spot.id}
            onPress={(event) => {
              event.stopPropagation();
              selectSpot(spot);
            }}
            pinColor={markerColor(spot)}
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
          subtitle={`${visibleSpots.length} spots disponibles`}
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
          <View style={styles.speciesFilterHeader}>
            <Text style={styles.inputLabel}>Poisson</Text>
            {selectedSpecies ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setSpeciesFilterId('all')}
                style={({ pressed }) => [styles.clearFilterButton, pressed && styles.pressed]}
              >
                <Text style={styles.clearFilterText}>Tous</Text>
              </Pressable>
            ) : null}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setSpeciesFilterId('all')}
                style={({ pressed }) => [styles.filterChip, speciesFilterId === 'all' && styles.filterChipActive, pressed && styles.pressed]}
              >
                <Text style={[styles.filterText, speciesFilterId === 'all' && styles.filterTextActive]}>Tous</Text>
              </Pressable>
              {species.map((item) => {
                const active = speciesFilterId === item.id;
                return (
                  <Pressable
                    accessibilityLabel={`Filtrer par ${item.name}`}
                    accessibilityRole="button"
                    key={item.id}
                    onPress={() => setSpeciesFilterId(item.id)}
                    style={({ pressed }) => [styles.filterChip, active && styles.filterChipActive, pressed && styles.pressed]}
                  >
                    <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
          {locationMessage ? <Text style={styles.errorText}>{locationMessage}</Text> : null}
        </Card>
      </View>

      <View style={[styles.mapControls, { bottom: 10 }]}>
        <Button iconLeft="locate-outline" onPress={locateUser} size="sm" title="Me localiser" variant="secondary" />
      </View>

      <View pointerEvents="box-none" style={styles.bottomOverlay}>
        {placementMode && !spotFormVisible ? (
          <Card elevated style={styles.placementCard}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Placer un nouveau spot</Text>
              <Pressable accessibilityRole="button" onPress={confirmCancelPlacement} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            <Text style={styles.previewText}>
              {draftCoordinate ? 'Déplacez le repère ou touchez une autre zone.' : 'Touchez la carte pour placer le repère.'}
            </Text>
            {spotError ? <Text style={styles.errorText}>{spotError}</Text> : null}
            <View style={styles.placementActions}>
              <Button onPress={confirmCancelPlacement} title="Annuler" variant="ghost" />
              <Button disabled={!draftCoordinate} onPress={confirmPlacement} title="Valider l'emplacement" />
            </View>
          </Card>
        ) : placementMode ? (
          <Card elevated style={styles.placementCard}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Nouveau spot</Text>
              <Pressable accessibilityRole="button" onPress={confirmCancelPlacement} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.spotFormScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.spotFormScroll}
            >
              <Input label="Nom du spot" onChangeText={(name) => setSpotDraft((current) => ({ ...current, name }))} value={spotDraft.name} />
              <Pressable
                accessibilityRole="button"
                onPress={pickSpotPhoto}
                style={({ pressed }) => [styles.photoPick, pressed && styles.pressed]}
              >
                {spotDraft.photo ? (
                  <Image source={{ uri: spotDraft.photo.uri }} style={styles.photoPreview} />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={22} color={colors.textMuted} />
                    <Text style={styles.photoPickText}>Ajouter une photo</Text>
                  </>
                )}
              </Pressable>
              <View>
                <Text style={styles.inputLabel}>Type d'eau</Text>
                <View style={styles.typeRow}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setSpotDraft((current) => ({ ...current, waterType: 'freshwater' }))}
                    style={[styles.typeChip, spotDraft.waterType === 'freshwater' && styles.typeChipFreshActive]}
                  >
                    <Text style={[styles.typeText, spotDraft.waterType === 'freshwater' && styles.typeTextActive]}>Eau douce</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setSpotDraft((current) => ({ ...current, waterType: 'saltwater' }))}
                    style={[styles.typeChip, spotDraft.waterType === 'saltwater' && styles.typeChipSeaActive]}
                  >
                    <Text style={[styles.typeText, spotDraft.waterType === 'saltwater' && styles.typeTextActive]}>Mer</Text>
                  </Pressable>
                </View>
              </View>
              <Input
                inputStyle={styles.textArea}
                label="Description (optionnelle)"
                multiline
                onChangeText={(description) => setSpotDraft((current) => ({ ...current, description }))}
                textAlignVertical="top"
                value={spotDraft.description}
              />
              {species.length > 0 ? (
                <View>
                  <Text style={styles.inputLabel}>Poissons présents</Text>
                  <View style={styles.speciesWrap}>
                    {species.map((item) => {
                      const active = spotDraft.speciesIds.includes(item.id);
                      return (
                        <Pressable
                          accessibilityRole="button"
                          key={item.id}
                          onPress={() => toggleDraftSpecies(item.id)}
                          style={[styles.speciesChip, active && styles.speciesChipActive]}
                        >
                          <Text style={[styles.speciesText, active && styles.speciesTextActive]}>{item.name}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}
              {spotError ? <Text style={styles.errorText}>{spotError}</Text> : null}
              <View style={styles.placementActions}>
                <Button onPress={confirmCancelPlacement} title="Annuler" variant="ghost" />
                <View style={styles.submitWrap}>
                  <Button disabled={!draftCoordinate || !spotDraft.name.trim()} loading={creatingSpot} onPress={submitSpot} title="Créer le spot" />
                </View>
              </View>
            </ScrollView>
          </Card>
        ) : selectedSpot ? (
          <Card elevated style={styles.previewCard}>
            {selectedSpot.imageUrl ? <Image source={{ uri: selectedSpot.imageUrl }} style={styles.previewImage} /> : null}
            <View style={styles.previewHeader}>
              <View style={styles.fill}>
                <Text style={styles.previewTitle}>{selectedSpot.name}</Text>
                <Text style={styles.muted}>{selectedSpot.location}</Text>
              </View>
              <Badge label={selectedSpot.waterType === 'freshwater' ? 'Eau douce' : 'Mer'} tone="secondary" />
            </View>
            <View style={styles.previewStats}>
              <Text style={styles.metaStrong}>{selectedSpot.rating > 0 ? `${selectedSpot.rating.toFixed(1)} / 5` : 'Pas encore noté'}</Text>
              <Text style={styles.muted}>{selectedSpot.favoritesCount ?? 0} favoris</Text>
            </View>
            {selectedSpecies ? <Text style={styles.filterSummary}>Filtré par : {selectedSpecies.name}</Text> : null}
            {selectedSpot.conditions ? <Text numberOfLines={2} style={styles.previewText}>{selectedSpot.conditions}</Text> : null}
            {spotError ? <Text style={styles.errorText}>{spotError}</Text> : null}
            <Button
              iconLeft={selectedSpot.favorite ? 'heart' : 'heart-outline'}
              loading={favoriteLoading}
              onPress={toggleFavorite}
              size="sm"
              title={selectedSpot.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              variant="outline"
            />
            <Button
              accessibilityLabel={`Ouvrir ${selectedSpot.name}`}
              onPress={() => navigation.navigate('SpotDetail', { spotId: selectedSpot.id })}
              size="sm"
              title="Voir le spot"
            />
          </Card>
        ) : !loading && !error && visibleSpots.length === 0 ? (
          <EmptyState
            description={selectedSpecies ? 'Aucun spot pour cette espèce dans la zone.' : 'Touchez le bouton + pour ajouter un spot.'}
            icon="search-outline"
            title="Aucun spot trouvé"
          />
        ) : null}

        {loading ? <EmptyState description="Chargement des spots." title="Chargement" /> : null}
        {!loading && error ? (
          <EmptyState actionLabel="Réessayer" description="Impossible de charger les spots." icon="alert-circle-outline" onActionPress={refresh} title="Erreur" />
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
  speciesFilterHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearFilterButton: {
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  clearFilterText: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapControls: {
    alignItems: 'flex-end',
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
  spotFormScroll: {
    maxHeight: 420,
  },
  spotFormScrollContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  placementActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-end',
  },
  inputLabel: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeChip: {
    backgroundColor: opacity.black06,
    borderRadius: radius.md,
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  typeChipFreshActive: {
    backgroundColor: colors.primary,
  },
  typeChipSeaActive: {
    backgroundColor: colors.secondary,
  },
  typeText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  typeTextActive: {
    color: colors.background,
  },
  photoPick: {
    alignItems: 'center',
    backgroundColor: opacity.black06,
    borderColor: opacity.black08,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 52,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoPickText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  photoPreview: {
    height: 120,
    width: '100%',
  },
  speciesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  speciesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  speciesChip: {
    backgroundColor: opacity.black06,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  speciesChipActive: {
    backgroundColor: colors.primary,
  },
  speciesText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  speciesTextActive: {
    color: colors.background,
  },
  submitWrap: {
    flexShrink: 0,
  },
  previewHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  previewImage: {
    borderRadius: radius.md,
    height: 120,
    width: '100%',
  },
  previewStats: {
    alignItems: 'center',
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
  filterSummary: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
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
