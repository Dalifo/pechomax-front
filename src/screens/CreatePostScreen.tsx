import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { getSpots } from '../services/spotService';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { EntityId, FishSpecies, FishingSpot } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePost'>;

type SelectedPhoto = {
  fileName?: string;
  mimeType?: string;
  uri: string;
};

export function CreatePostScreen({ navigation }: Props) {
  const [species, setSpecies] = useState<FishSpecies[]>([]);
  const [spots, setSpots] = useState<FishingSpot[]>([]);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<EntityId | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<EntityId | null>(null);
  const [weightLabel, setWeightLabel] = useState('');
  const [lengthLabel, setLengthLabel] = useState('');
  const [dateLabel, setDateLabel] = useState("Aujourd'hui");
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<SelectedPhoto | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { submitPost, submitting } = useCreatePost();

  useEffect(() => {
    let active = true;

    async function loadOptions() {
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
          setError('Impossible de charger les options de publication.');
        }
      } finally {
        if (active) {
          setLoadingOptions(false);
        }
      }
    }

    loadOptions();

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
  const valid =
    Boolean(photo) &&
    Boolean(selectedSpecies) &&
    Boolean(selectedSpot) &&
    weightLabel.trim().length > 0 &&
    lengthLabel.trim().length > 0 &&
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

  const submit = async () => {
    if (!valid || !selectedSpecies || !selectedSpot || !photo) {
      setError('Completez les champs obligatoires avant de publier.');
      return;
    }

    setError(null);

    try {
      const createdPost = await submitPost({
        dateLabel,
        description: description.trim(),
        fishName: selectedSpecies.name,
        lengthLabel,
        locationId: selectedSpot.id,
        photoName: photo.fileName,
        photoType: photo.mimeType,
        photoUri: photo.uri,
        speciesId: selectedSpecies.id,
        spotName: selectedSpot.name,
        weightLabel,
      });
      navigation.replace('PostDetail', { postId: createdPost.id });
    } catch {
      setError('Impossible de publier cette prise. Veuillez verifier les informations et reessayer.');
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
              <Text style={styles.photoHint}>Choisissez une image de votre galerie</Text>
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
          <EmptyState description="Chargement des especes et des spots." icon="fish-outline" title="Chargement" />
        ) : null}

        {!loadingOptions && (species.length === 0 || spots.length === 0) ? (
          <EmptyState
            description="Les especes et les spots doivent etre disponibles avant de publier."
            icon="alert-circle-outline"
            title="Publication indisponible"
          />
        ) : null}

        {!loadingOptions && species.length > 0 && spots.length > 0 ? (
          <Card style={styles.formCard}>
            <Select
              iconLeft="fish-outline"
              label="Espèce"
              onChange={setSelectedSpeciesId}
              options={species.map((item) => ({ label: item.name, value: item.id }))}
              placeholder="Choisir une espèce…"
              value={selectedSpeciesId}
            />

            <Text style={styles.label}>Spot</Text>
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

            <Input iconLeft="scale-outline" label="Poids" onChangeText={setWeightLabel} placeholder="Ex: 4.2 kg" value={weightLabel} />
            <Input iconLeft="resize-outline" label="Longueur" onChangeText={setLengthLabel} placeholder="Ex: 82 cm" value={lengthLabel} />
            <Input iconLeft="calendar-outline" label="Date" onChangeText={setDateLabel} value={dateLabel} />
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

        <Button
          accessibilityLabel="Publier ma prise"
          disabled={!valid || submitting || loadingOptions}
          loading={submitting}
          onPress={submit}
          title="Publier ma prise"
        />
        <Button accessibilityLabel="Annuler" onPress={navigation.goBack} title="Annuler" variant="ghost" />
      </View>
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
  errorText: {
    color: colors.danger,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  textArea: {
    minHeight: 104,
  },
  pressed: {
    opacity: 0.72,
  },
});

