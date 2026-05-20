import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { useProfile } from '../hooks/useProfile';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const { data: profile, loading, saveProfile } = useProfile();
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('Annecy, France');
  const [profilePic, setProfilePic] = useState<{ name?: string; type?: string; uri: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setHeadline(profile.headline);
    }
  }, [profile]);

  const submit = async () => {
    if (!displayName.trim() || !headline.trim()) {
      return;
    }

    setSaving(true);
    try {
      await saveProfile({
        displayName,
        headline,
        location,
        profilePicName: profilePic?.name,
        profilePicType: profilePic?.type,
        profilePicUri: profilePic?.uri,
      });
      navigation.goBack();
    } catch {
      Alert.alert('Enregistrement impossible', 'Veuillez reessayer.');
    } finally {
      setSaving(false);
    }
  };

  const pickProfilePic = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Acces photos requis', 'Autorisez l acces aux photos pour changer votre image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setProfilePic({
        name: asset.fileName ?? 'profile.jpg',
        type: asset.mimeType ?? 'image/jpeg',
        uri: asset.uri,
      });
    }
  };

  if (loading && !profile) {
    return (
      <Screen padded={false}>
        <AppHeader onBack={navigation.goBack} showBack title="Modifier le profil" />
        <EmptyState description="Chargement du profil." icon="person-outline" title="Chargement" />
      </Screen>
    );
  }

  return (
    <Screen avoidKeyboard padded={false} scroll>
      <AppHeader
        action={<Button disabled={saving} loading={saving} onPress={submit} size="sm" title="Enregistrer" variant="ghost" />}
        onBack={navigation.goBack}
        showBack
        title="Modifier le profil"
      />
      <View style={styles.content}>
        <Card style={styles.avatarCard}>
          <View style={styles.avatarWrap}>
            <Avatar initials={profile?.displayName ?? 'PM'} size="xl" source={profilePic ? { uri: profilePic.uri } : profile?.profilePic ? { uri: profile.profilePic } : undefined} />
            <Pressable
              accessibilityLabel="Changer la photo"
              accessibilityRole="button"
              onPress={pickProfilePic}
              style={styles.cameraButton}
            >
              <Ionicons name="camera-outline" size={16} color={colors.background} />
            </Pressable>
          </View>
          <Text style={styles.muted}>Appuyez pour changer la photo</Text>
        </Card>

        <Card style={styles.formCard}>
          <Input iconLeft="person-outline" label="Nom" onChangeText={setDisplayName} value={displayName} />
          <Input
            inputStyle={styles.textArea}
            label="Biographie"
            maxLength={150}
            multiline
            onChangeText={setHeadline}
            textAlignVertical="top"
            value={headline}
          />
          <Text style={styles.counter}>{headline.length}/150 caracteres</Text>
          <Input iconLeft="location-outline" label="Localisation" onChangeText={setLocation} value={location} />
        </Card>

        <Button disabled={saving} loading={saving} onPress={submit} title="Enregistrer les modifications" />
        <Button onPress={navigation.goBack} title="Annuler" variant="secondary" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  avatarCard: {
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrap: {
    position: 'relative',
  },
  cameraButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.background,
    borderRadius: radius.round,
    borderWidth: 3,
    bottom: 0,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 34,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  formCard: {
    gap: spacing.lg,
  },
  textArea: {
    minHeight: 86,
  },
  counter: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    marginTop: -spacing.md,
    textAlign: 'right',
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
});
