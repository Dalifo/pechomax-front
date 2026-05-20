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
import { SettingsSection } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const sections: SettingsSection[] = [
  {
    title: 'Compte',
    items: [
      { id: 'notifications', label: 'Notifications', value: 'Activees', icon: 'notifications-outline' },
      { id: 'privacy', label: 'Confidentialite', icon: 'lock-closed-outline' },
      { id: 'language', label: 'Langue', value: 'Francais', icon: 'globe-outline' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { id: 'dark', label: 'Mode sombre', value: 'Desactive', icon: 'moon-outline' },
      { id: 'vibrations', label: 'Vibrations', value: 'Activees', icon: 'phone-portrait-outline' },
      { id: 'location', label: 'Localisation', value: 'Toujours', icon: 'location-outline' },
    ],
  },
  {
    title: 'Bibliotheques',
    items: [
      { id: 'fish', label: 'Base de poissons', icon: 'fish-outline' },
      { id: 'articles', label: 'Articles', icon: 'newspaper-outline' },
      { id: 'tools', label: 'Outils', icon: 'construct-outline' },
      { id: 'shops', label: 'Magasins', icon: 'storefront-outline' },
      { id: 'logbook', label: 'Journal de bord', icon: 'book-outline' },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: 'guide', label: 'Guide utilisateur', icon: 'book-outline' },
      { id: 'faq', label: 'FAQ', icon: 'help-circle-outline' },
      { id: 'contact', label: 'Contact', icon: 'mail-outline' },
    ],
  },
];

export function SettingsScreen({ navigation }: Props) {
  const { logout } = useAuth();

  const showUnavailable = () => {
    Alert.alert('Fonction bientot disponible', 'Cette action sera ajoutee apres la demo.');
  };

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
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <SectionTitle title={section.title} />
            {section.items.map((item) => (
              <ListItem
                badgeLabel={item.value}
                badgeTone="secondary"
                icon={item.icon}
                key={item.id}
                onPress={() => {
                  if (item.id === 'notifications') {
                    navigation.navigate('Notifications');
                    return;
                  }
                  if (item.id === 'guide') {
                    navigation.navigate('UserGuide');
                    return;
                  }
                  if (item.id === 'faq') {
                    navigation.navigate('FAQ');
                    return;
                  }
                  if (item.id === 'contact') {
                    navigation.navigate('Contact');
                    return;
                  }
                  if (item.id === 'fish') {
                    navigation.navigate('FishDatabase');
                    return;
                  }
                  if (item.id === 'articles') {
                    navigation.navigate('Articles');
                    return;
                  }
                  if (item.id === 'tools') {
                    navigation.navigate('Tools');
                    return;
                  }
                  if (item.id === 'shops') {
                    navigation.navigate('Shops');
                    return;
                  }
                  if (item.id === 'logbook') {
                    navigation.navigate('Logbook');
                    return;
                  }
                  showUnavailable();
                }}
                title={item.label}
              />
            ))}
          </View>
        ))}
        <Button iconLeft="log-out-outline" onPress={confirmLogout} title="Se deconnecter" variant="earth" />
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
