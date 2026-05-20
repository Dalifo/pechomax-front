import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Button } from '../components/ui/Button';
import { ListItem } from '../components/ui/ListItem';
import { SectionTitle } from '../components/ui/SectionTitle';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const { logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert('Deconnexion', 'Voulez-vous vous deconnecter ?', [
      { style: 'cancel', text: 'Annuler' },
      {
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
        style: 'destructive',
        text: 'Se deconnecter',
      },
    ]);
  };

  return (
    <Screen padded={false} scroll>
      <AppHeader onBack={navigation.goBack} showBack title="Parametres" />
      <View style={styles.content}>
        <View style={styles.section}>
          <SectionTitle title="Compte" />
          <ListItem
            icon="person-outline"
            onPress={() => navigation.navigate('EditProfile')}
            title="Modifier mon profil"
          />
        </View>

        <View style={styles.section}>
          <SectionTitle title="Aide" />
          <ListItem icon="book-outline" onPress={() => navigation.navigate('UserGuide')} title="Guide utilisateur" />
          <ListItem icon="help-circle-outline" onPress={() => navigation.navigate('FAQ')} title="FAQ" />
          <ListItem icon="mail-outline" onPress={() => navigation.navigate('Contact')} title="Contact" />
        </View>

        <View style={styles.section}>
          <SectionTitle title="Session" />
          <Button iconLeft="log-out-outline" onPress={confirmLogout} title="Se deconnecter" variant="earth" />
        </View>

        <Text style={styles.version}>Pechomax v1.0.0</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    padding: spacing.xxl,
  },
  section: {
    gap: spacing.md,
  },
  version: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
});
