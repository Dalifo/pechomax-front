import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useRef, useState } from 'react';
import { Animated, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  latitude: string;
  longitude: string;
  name: string;
};

function draftFromRegion(region: Region): SpotDraft {
  return {
    description: '',
    latitude: region.latitude.toFixed(6),
    longitude: region.longitude.toFixed(6),
    name: '',
  };
}

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

function coordinateFromInput(value: string) {
  const parsed = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function validCoordinate(latitude: number | null, longitude: number | null) {
  return (
    latitude !== null &&
    longitude !== null &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
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
  const sheetTranslateY = useRef(new Animated.Value(0)).current;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');
  const [selectedSpotId, setSelectedSpotId] = useState<EntityId | null>(null);
  const [currentRegion, setCurrentRegion] = useState<Region>(FRANCE_REGION);
  const [spotModalVisible, setSpotModalVisible] = useState(false);
  const [spotDraft, setSpotDraft] = useState<SpotDraft>(draftFromRegion(FRANCE_REGION));
  const [creatingSpot, setCreatingSpot] = useState(false);
  const [spotError, setSpotError] = useState<string | null>(null);
  const { error, filteredSpots, loading, refresh } = useSpots(filter, query);
  const mappableSpots = useMemo(() => filteredSpots.filter((spot) => spot.coordinates), [filteredSpots]);
  const mapRegion = useMemo(() => getRegion(mappableSpots.length > 0 ? mappableSpots : filteredSpots), [filteredSpots, mappableSpots]);
  const selectedSpot = filteredSpots.find((spot) => spot.id === selectedSpotId) ?? filteredSpots[0] ?? null;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 8,
        onPanResponderMove: (_, gesture) => {
          sheetTranslateY.setValue(Math.max(-120, Math.min(110, gesture.dy)));
        },
        onPanResponderRelease: (_, gesture) => {
          Animated.spring(sheetTranslateY, {
            toValue: gesture.dy < -40 ? -120 : gesture.dy > 40 ? 110 : 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [sheetTranslateY],
  );

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

  const openCreateSpot = (draft = draftFromRegion(currentRegion)) => {
    setSpotDraft(draft);
    setSpotError(null);
    setSpotModalVisible(true);
  };

  const onMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    openCreateSpot({
      description: '',
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6),
      name: '',
    });
  };

  const submitSpot = async () => {
    const latitude = coordinateFromInput(spotDraft.latitude);
    const longitude = coordinateFromInput(spotDraft.longitude);

    if (!spotDraft.name.trim() || !spotDraft.description.trim() || !validCoordinate(latitude, longitude)) {
      setSpotError('Nom, description et coordonnees valides sont obligatoires.');
      return;
    }

    const validLatitude = latitude ?? 0;
    const validLongitude = longitude ?? 0;
    setCreatingSpot(true);
    setSpotError(null);

    try {
      const spot = await createSpot({
        description: spotDraft.description,
        latitude: validLatitude,
        longitude: validLongitude,
        name: spotDraft.name,
      });
      await refresh();
      setSelectedSpotId(spot.id);
      setSpotModalVisible(false);
      if (spot.coordinates) {
        mapRef.current?.animateToRegion({ ...spot.coordinates, latitudeDelta: 0.08, longitudeDelta: 0.08 }, 350);
      }
    } catch {
      setSpotError('Impossible de creer ce spot. Verifiez les coordonnees et reessayez.');
    } finally {
      setCreatingSpot(false);
    }
  };

  return (
    <Screen padded={false} style={styles.root}>
      <AppHeader
        action={<IconButton accessibilityLabel="Ajouter un spot" icon="add" onPress={() => openCreateSpot()} variant="primary" />}
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
        <RNMapView
          ref={mapRef}
          initialRegion={mapRegion}
          onPress={onMapPress}
          onRegionChangeComplete={setCurrentRegion}
          style={styles.map}
        >
          {mappableSpots.map((spot) => (
            <Marker
              anchor={{ x: 0.5, y: 0.5 }}
              coordinate={spot.coordinates!}
              key={spot.id}
              onPress={() => selectSpot(spot)}
              title={spot.name}
            >
              <View style={styles.markerWrap}>
                <View style={[styles.marker, spot.id === selectedSpot?.id && styles.markerSelected]}>
                  <Ionicons name="fish-outline" size={18} color={colors.background} />
                </View>
              </View>
            </Marker>
          ))}
        </RNMapView>

        <View style={styles.mapControls}>
          <IconButton accessibilityLabel="Recentrer la carte" icon="navigate-outline" onPress={recenter} variant="soft" />
        </View>
      </View>

      <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: sheetTranslateY }] }]}>
        <View {...panResponder.panHandlers} style={styles.sheetHandleArea}>
          <View style={styles.sheetHandle} />
        </View>
        <ScrollView contentContainerStyle={styles.sheetContent} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Spots a proximite</Text>
            <Text style={styles.muted}>{filteredSpots.length} resultats</Text>
          </View>

          {loading ? <EmptyState description="Chargement des spots." title="Chargement" /> : null}

          {!loading && error ? (
            <EmptyState actionLabel="Reessayer" description="Impossible de charger les spots." icon="alert-circle-outline" onActionPress={refresh} title="Erreur" />
          ) : null}

          {!loading && !error && filteredSpots.length === 0 ? (
            <EmptyState description="Touchez la carte ou utilisez le bouton + pour ajouter un spot." icon="search-outline" title="Aucun spot trouve" />
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
        </ScrollView>
      </Animated.View>

      <Modal animationType="slide" onRequestClose={() => setSpotModalVisible(false)} transparent visible={spotModalVisible}>
        <View style={styles.modalBackdrop}>
          <Card elevated style={styles.modalCard}>
            <View style={styles.panelHeader}>
              <Text style={styles.modalTitle}>Ajouter un spot</Text>
              <Pressable accessibilityRole="button" onPress={() => setSpotModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            <Input label="Nom du spot" onChangeText={(name) => setSpotDraft((current) => ({ ...current, name }))} value={spotDraft.name} />
            <Input
              inputStyle={styles.textArea}
              label="Description"
              multiline
              onChangeText={(description) => setSpotDraft((current) => ({ ...current, description }))}
              textAlignVertical="top"
              value={spotDraft.description}
            />
            <View style={styles.coordinateRow}>
              <Input
                containerStyle={styles.coordinateInput}
                keyboardType="decimal-pad"
                label="Latitude"
                onChangeText={(latitude) => setSpotDraft((current) => ({ ...current, latitude }))}
                value={spotDraft.latitude}
              />
              <Input
                containerStyle={styles.coordinateInput}
                keyboardType="decimal-pad"
                label="Longitude"
                onChangeText={(longitude) => setSpotDraft((current) => ({ ...current, longitude }))}
                value={spotDraft.longitude}
              />
            </View>
            {spotError ? <Text style={styles.errorText}>{spotError}</Text> : null}
            <Button loading={creatingSpot} onPress={submitSpot} title="Creer le spot" />
          </Card>
        </View>
      </Modal>
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
    minHeight: 360,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    height: '100%',
    width: '100%',
  },
  markerWrap: {
    padding: 8,
  },
  marker: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.background,
    borderRadius: 22,
    borderWidth: 3,
    height: 44,
    justifyContent: 'center',
    width: 44,
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
