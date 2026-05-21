import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import RNMapView, { MapPressEvent, Marker } from 'react-native-maps';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useCreatePost } from '../hooks/usePosts';
import { RootStackParamList } from '../navigation/types';
import { getFishSpecies } from '../services/fishService';
import { createSpot, getSpots } from '../services/spotService';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { EntityId, FishSpecies, FishingSpot, WaterType } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePost'>;

type SelectedPhoto = {
  fileName?: string;
  mimeType?: string;
  uri: string;
};

type SpotDraft = {
  description: string;
  name: string;
  photo: SelectedPhoto | null;
  speciesIds: EntityId[];
  waterType: WaterType;
};

const defaultSpotDraft: SpotDraft = {
  description: '',
  name: '',
  photo: null,
  speciesIds: [],
  waterType: 'freshwater',
};

type SpotCoordinate = {
  latitude: number;
  longitude: number;
};

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

function integerFromInput(value: string) {
  const parsed = Number.parseInt(value.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : null;
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

export function CreatePostScreen({ navigation }: Props) {
  const allowNavigationAfterSubmitRef = useRef(false);
  const [species, setSpecies] = useState<FishSpecies[]>([]);
  const [spots, setSpots] = useState<FishingSpot[]>([]);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<EntityId | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<EntityId | null>(null);
  const [weightGrams, setWeightGrams] = useState('');
  const [lengthCentimeters, setLengthCentimeters] = useState('');
  const [catchDate, setCatchDate] = useState(() => new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<SelectedPhoto | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spotModalVisible, setSpotModalVisible] = useState(false);
  const [spotFormVisible, setSpotFormVisible] = useState(false);
  const [spotDraft, setSpotDraft] = useState<SpotDraft>(defaultSpotDraft);
  const [spotCoordinate, setSpotCoordinate] = useState<SpotCoordinate | null>(null);
  const [spotModalError, setSpotModalError] = useState<string | null>(null);
  const [creatingSpot, setCreatingSpot] = useState(false);
  const [showFormError, setShowFormError] = useState(false);
  const { submitPost, submitting } = useCreatePost();

  const isDirty = Boolean(photo) || description.trim().length > 0 || weightGrams !== '' || lengthCentimeters !== '';
  const isSpotDirty = spotCoordinate !== null || spotDraft.name.trim().length > 0 || spotDraft.description.trim().length > 0 || spotDraft.photo !== null;

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (allowNavigationAfterSubmitRef.current || !isDirty) return;
      e.preventDefault();
      Alert.alert(
        "Annuler la création ?",
        "Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.",
        [
          { style: 'cancel', text: 'Continuer' },
          { onPress: () => navigation.dispatch(e.data.action), style: 'destructive', text: 'Annuler quand même' },
        ],
      );
    });
    return unsubscribe;
  }, [isDirty, navigation]);

  const confirmCloseSpot = () => {
    if (!isSpotDirty) { closeSpotModal(); return; }
    Alert.alert(
      "Annuler le spot ?",
      "Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.",
      [
        { style: 'cancel', text: 'Continuer' },
        { onPress: closeSpotModal, style: 'destructive', text: 'Annuler quand même' },
      ],
    );
  };

  const loadOptions = async () => {
    setLoadingOptions(true);
    setError(null);

    try {
      const [nextSpecies, nextSpots] = await Promise.all([getFishSpecies(), getSpots()]);
      setSpecies(nextSpecies);
      setSpots(nextSpots);
      setSelectedSpeciesId((current) => current ?? nextSpecies[0]?.id ?? null);
      setSelectedSpotId((current) => current ?? nextSpots[0]?.id ?? null);
    } catch {
      setError('Impossible de charger les espèces et les spots.');
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [nextSpecies, nextSpots] = await Promise.all([getFishSpecies(), getSpots()]);
        if (!active) {
          return;
        }
        setSpecies(nextSpecies);
        setSpots(nextSpots);
        setSelectedSpeciesId(nextSpecies[0]?.id ?? null);
        setSelectedSpotId(nextSpots[0]?.id ?? null);
      } catch {
        if (active) {
          setError('Impossible de charger les espèces et les spots.');
        }
      } finally {
        if (active) {
          setLoadingOptions(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const selectedSpecies = useMemo(
    () => species.find((item) => item.id === selectedSpeciesId) ?? null,
    [selectedSpeciesId, species],
  );
  const selectedSpot = useMemo(
    () => spots.find((item) => item.id === selectedSpotId) ?? null,
    [selectedSpotId, spots],
  );
  const weightValue = integerFromInput(weightGrams);
  const lengthValue = integerFromInput(lengthCentimeters);
  const valid =
    Boolean(photo) &&
    Boolean(selectedSpecies) &&
    Boolean(selectedSpot) &&
    weightValue !== null &&
    weightValue > 0 &&
    lengthValue !== null &&
    lengthValue > 0 &&
    description.trim().length > 0;

  const pickPhoto = async () => {
    setError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Autorisez l acces aux photos pour ajouter une image.');
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
    setPhoto({
      fileName: asset.fileName ?? 'catch.jpg',
      mimeType: asset.mimeType ?? 'image/jpeg',
      uri: asset.uri,
    });
  };

  const onSpotMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSpotCoordinate({ latitude, longitude });
    setSpotModalError(null);
  };

  const closeSpotModal = () => {
    setSpotModalVisible(false);
    setSpotFormVisible(false);
    setSpotDraft(defaultSpotDraft);
    setSpotCoordinate(null);
    setSpotModalError(null);
  };

  const confirmSpotPlacement = () => {
    if (!validCoordinate(spotCoordinate)) {
      setSpotModalError('Touchez la carte pour placer le repere du spot.');
      return;
    }

    setSpotModalError(null);
    setSpotFormVisible(true);
  };

  const pickSpotPhoto = async () => {
    setSpotModalError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setSpotModalError('Autorisez l acces aux photos pour ajouter une image.');
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

  const toggleSpotSpecies = (speciesId: EntityId) => {
    setSpotDraft((current) => ({
      ...current,
      speciesIds: current.speciesIds.includes(speciesId)
        ? current.speciesIds.filter((id) => id !== speciesId)
        : [...current.speciesIds, speciesId],
    }));
  };

  const submit = async () => {
    if (!valid || !selectedSpecies || !selectedSpot || !photo || weightValue === null || lengthValue === null) {
      setError('Complétez les champs obligatoires avec des valeurs valides.');
      return;
    }

    setError(null);

    try {
      const createdPost = await submitPost({
        date: catchDate,
        description: description.trim(),
        lengthCentimeters: lengthValue,
        locationId: selectedSpot.id,
        photoName: photo.fileName,
        photoType: photo.mimeType,
        photoUri: photo.uri,
        speciesId: selectedSpecies.id,
        weightGrams: weightValue,
      });
      allowNavigationAfterSubmitRef.current = true;
      navigation.replace('PostDetail', { postId: createdPost.id });
    } catch {
      setError('Impossible de publier cette prise. Vérifiez la photo, la connexion et réessayez.');
    }
  };

  const submitSpot = async () => {
    const coordinate = spotCoordinate;

    if (!spotDraft.name.trim() || !validCoordinate(coordinate)) {
      setSpotModalError('Placez le repere sur la carte et renseignez un nom pour le spot.');
      return;
    }

    setCreatingSpot(true);
    setSpotModalError(null);

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
      setSpots((current) => [spot, ...current.filter((item) => item.id !== spot.id)]);
      setSelectedSpotId(spot.id);
      setSpotDraft(defaultSpotDraft);
      setSpotCoordinate(null);
      setSpotFormVisible(false);
      setSpotModalVisible(false);
      setSpotModalError(null);
    } catch {
      setSpotModalError('Impossible de créer ce spot. Vérifiez la connexion et réessayez.');
    } finally {
      setCreatingSpot(false);
    }
  };

  return (
    <Screen avoidKeyboard padded={false} scroll>
      <AppHeader
        action={<Button disabled={!valid || submitting || loadingOptions} loading={submitting} onPress={submit} size="sm" title="Publier" />}
        onBack={navigation.goBack}
        showBack
        title="Nouvelle prise"
      />

      <View style={styles.content}>
        <Pressable
          accessibilityLabel={photo ? 'Changer la photo' : 'Ajouter une photo'}
          accessibilityRole="button"
          onPress={pickPhoto}
          style={({ pressed }) => [styles.photoArea, photo && styles.photoAreaActive, pressed && styles.pressed]}
        >
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={48} color={colors.textMuted} />
              <Text style={styles.photoTitle}>Ajouter une photo</Text>
              <Text style={styles.photoHint}>Une photo est obligatoire pour publier</Text>
            </>
          )}
        </Pressable>

        {photo ? (
          <View style={styles.photoActions}>
            <Button iconLeft="image-outline" onPress={pickPhoto} size="sm" title="Remplacer" variant="outline" />
            <Button iconLeft="trash-outline" onPress={() => setPhoto(null)} size="sm" title="Retirer" variant="ghost" />
          </View>
        ) : null}

        {loadingOptions ? (
          <EmptyState description="Chargement des espèces et des spots." icon="fish-outline" title="Chargement" />
        ) : null}

        {!loadingOptions && (species.length === 0 || spots.length === 0) ? (
          <EmptyState
            actionLabel="Réessayer"
            description="Les espèces et les spots doivent être disponibles avant de publier."
            icon="alert-circle-outline"
            onActionPress={loadOptions}
            title="Publication indisponible"
          />
        ) : null}

        {!loadingOptions && species.length > 0 ? (
          <Card style={styles.formCard}>
            <Select
              iconLeft="fish-outline"
              label="Espece"
              onChange={setSelectedSpeciesId}
              options={species.map((item) => ({ label: item.name, value: item.id }))}
              placeholder="Choisir une espece"
              value={selectedSpeciesId}
            />

            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Spot</Text>
              <Button
                iconLeft="add"
                onPress={() => {
                  setSpotDraft({
                    ...defaultSpotDraft,
                    speciesIds: selectedSpeciesId ? [selectedSpeciesId] : [],
                  });
                  setSpotCoordinate(null);
                  setSpotFormVisible(false);
                  setSpotModalError(null);
                  setSpotModalVisible(true);
                }}
                size="sm"
                title="Créer un spot"
                variant="outline"
              />
            </View>
            {spots.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.choiceRow}>
                  {spots.map((item) => (
                    <Pressable
                      accessibilityRole="button"
                      key={item.id}
                      onPress={() => setSelectedSpotId(item.id)}
                      style={[styles.choiceChip, item.id === selectedSpotId && styles.choiceChipActive]}
                    >
                      <Text style={[styles.choiceText, item.id === selectedSpotId && styles.choiceTextActive]}>{item.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <Text style={styles.helperText}>Créez un spot pour pouvoir publier votre prise.</Text>
            )}

            <Input
              iconLeft="scale-outline"
              keyboardType="number-pad"
              label="Poids (g)"
              onChangeText={setWeightGrams}
              placeholder="Ex: 4200"
              value={weightGrams}
            />
            <Input
              iconLeft="resize-outline"
              keyboardType="number-pad"
              label="Longueur (cm)"
              onChangeText={setLengthCentimeters}
              placeholder="Ex: 82"
              value={lengthCentimeters}
            />

            <View style={styles.dateBlock}>
              <Text style={styles.label}>Date de la prise</Text>
              <Pressable accessibilityRole="button" onPress={() => setShowDatePicker(true)} style={styles.dateValue}>
                <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
                <Text style={styles.dateText}>{formatDateLabel(catchDate)}</Text>
              </Pressable>
              {showDatePicker ? (
                <DateTimePicker
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date()}
                  mode="date"
                  onChange={(_, selectedDate) => {
                    if (Platform.OS !== 'ios') {
                      setShowDatePicker(false);
                    }

                    if (selectedDate) {
                      setCatchDate(selectedDate);
                    }
                  }}
                  value={catchDate}
                />
              ) : null}
            </View>

            <Input
              inputStyle={styles.textArea}
              label="Description"
              multiline
              onChangeText={setDescription}
              placeholder="Conditions, technique, materiel..."
              textAlignVertical="top"
              value={description}
            />
          </Card>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable onPress={() => { if (!valid) setShowFormError(true); }}>
          <Button
            accessibilityLabel="Publier ma prise"
            disabled={!valid || submitting || loadingOptions}
            loading={submitting}
            onPress={submit}
            title="Publier ma prise"
          />
        </Pressable>
        {showFormError && !valid ? (
          <Text style={styles.formErrorText}>Formulaire incomplet — veuillez remplir tous les champs obligatoires.</Text>
        ) : null}
        <Button accessibilityLabel="Annuler" onPress={navigation.goBack} title="Annuler" variant="ghost" />
      </View>

      <Modal animationType="slide" onRequestClose={confirmCloseSpot} transparent visible={spotModalVisible}>
        <View style={styles.modalBackdrop}>
          <Card elevated style={styles.modalCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.modalTitle}>Créer un spot</Text>
              <Pressable accessibilityRole="button" onPress={confirmCloseSpot} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            <View style={styles.spotMapWrap}>
              <RNMapView
                initialRegion={{
                  latitude: selectedSpot?.coordinates?.latitude ?? 46.603354,
                  latitudeDelta: 0.08,
                  longitude: selectedSpot?.coordinates?.longitude ?? 1.888334,
                  longitudeDelta: 0.08,
                }}
                onPress={onSpotMapPress}
                style={styles.spotMap}
              >
                {spotCoordinate ? (
                  <Marker
                    coordinate={spotCoordinate}
                    draggable
                    onDragEnd={(event) => setSpotCoordinate(event.nativeEvent.coordinate)}
                    pinColor={colors.secondary}
                  />
                ) : null}
              </RNMapView>
            </View>
            <Text style={styles.helperText}>
              {spotCoordinate ? 'Deplacez le repere ou touchez une autre zone.' : 'Touchez la carte pour placer le spot.'}
            </Text>
            {spotModalError ? <Text style={styles.errorText}>{spotModalError}</Text> : null}
            {!spotFormVisible ? (
              <View style={styles.spotModalActions}>
                <Button onPress={confirmCloseSpot} title="Annuler" variant="ghost" />
                <Button disabled={!spotCoordinate} onPress={confirmSpotPlacement} title="Valider l'emplacement" />
              </View>
            ) : (
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
                  style={({ pressed }) => [styles.spotPhotoPick, pressed && styles.pressed]}
                >
                  {spotDraft.photo ? (
                    <Image source={{ uri: spotDraft.photo.uri }} style={styles.spotPhotoPreview} />
                  ) : (
                    <>
                      <Ionicons name="camera-outline" size={22} color={colors.textMuted} />
                      <Text style={styles.helperText}>Ajouter une photo du spot</Text>
                    </>
                  )}
                </Pressable>
                <View>
                  <Text style={styles.label}>Type d'eau</Text>
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
                  inputStyle={styles.textAreaSmall}
                  label="Description (optionnelle)"
                  multiline
                  onChangeText={(description) => setSpotDraft((current) => ({ ...current, description }))}
                  textAlignVertical="top"
                  value={spotDraft.description}
                />
                <View>
                  <Text style={styles.label}>Poissons presents</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.choiceRow}>
                      {species.map((item) => {
                        const active = spotDraft.speciesIds.includes(item.id);
                        return (
                          <Pressable
                            accessibilityRole="button"
                            key={item.id}
                            onPress={() => toggleSpotSpecies(item.id)}
                            style={[styles.choiceChip, active && styles.choiceChipActive]}
                          >
                            <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{item.name}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
                <Button disabled={!spotCoordinate || !spotDraft.name.trim()} loading={creatingSpot} onPress={submitSpot} title="Créer ce spot" />
              </ScrollView>
            )}
          </Card>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  photoArea: {
    alignItems: 'center',
    aspectRatio: 4 / 3,
    backgroundColor: opacity.black06,
    borderColor: opacity.black08,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoAreaActive: {
    backgroundColor: opacity.black08,
  },
  photoPreview: {
    height: '100%',
    width: '100%',
  },
  photoActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoTitle: {
    color: colors.textMuted,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.weights.bold,
    marginTop: spacing.md,
  },
  photoHint: {
    color: colors.textSoft,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  formCard: {
    gap: spacing.lg,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  label: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  choiceChip: {
    backgroundColor: opacity.black06,
    borderRadius: radius.round,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  choiceChipActive: {
    backgroundColor: colors.primary,
  },
  choiceText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  choiceTextActive: {
    color: colors.background,
  },
  dateBlock: {
    gap: spacing.sm,
  },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateValue: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  dateText: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  errorText: {
    color: colors.danger,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  formErrorText: {
    color: colors.danger,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  helperText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  textArea: {
    minHeight: 104,
  },
  textAreaSmall: {
    minHeight: 82,
  },
  spotMapWrap: {
    borderColor: opacity.black08,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    height: 220,
    overflow: 'hidden',
  },
  spotMap: {
    height: '100%',
    width: '100%',
  },
  spotFormScroll: {
    maxHeight: 360,
  },
  spotFormScrollContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  spotPhotoPick: {
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
  spotPhotoPreview: {
    height: 120,
    width: '100%',
  },
  spotModalActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-end',
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
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
    maxHeight: '88%',
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
});
