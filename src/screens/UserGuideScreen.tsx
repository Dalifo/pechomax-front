import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BrandLogo } from '../components/brand/BrandLogo';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Card } from '../components/ui/Card';
import { SectionTitle } from '../components/ui/SectionTitle';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { IconName } from '../types/profile';

type Props = NativeStackScreenProps<RootStackParamList, 'UserGuide'>;

type GuideSection = {
  id: string;
  title: string;
  icon: IconName;
  items: {
    title: string;
    description: string;
    steps: string[];
  }[];
};

const guideSections: GuideSection[] = [
  {
    id: 'getting-started',
    title: 'Premiers pas',
    icon: 'flag-outline',
    items: [
      {
        title: 'Creer un compte',
        description: 'Votre profil permet de sauvegarder les spots, publier vos prises et echanger avec la communaute.',
        steps: ['Ouvrez Welcome puis Register', 'Completez les champs requis', 'Connectez-vous au flux principal', 'Personnalisez votre profil'],
      },
      {
        title: "Naviguer dans l'application",
        description: 'Les cinq onglets couvrent les usages principaux.',
        steps: ['Accueil: resume et recommandations', 'Carte: spots proches', 'Forum: publications', 'Messages: conversations', 'Profil: statistiques et compte'],
      },
    ],
  },
  {
    id: 'map',
    title: 'Utiliser la carte',
    icon: 'map-outline',
    items: [
      {
        title: 'Trouver un spot',
        description: 'La carte affiche les spots disponibles et vous permet d ouvrir leur fiche.',
        steps: ['Filtrez par eau douce ou mer', 'Recherchez un nom ou une zone', 'Selectionnez un pin', 'Ouvrez la fiche spot'],
      },
    ],
  },
  {
    id: 'community',
    title: 'Communaute',
    icon: 'chatbubbles-outline',
    items: [
      {
        title: 'Publier une prise',
        description: 'Le formulaire permet de publier une prise complete avec photo.',
        steps: ['Appuyez sur plus', 'Choisissez une espece et un spot', 'Ajoutez une photo', 'Renseignez poids, longueur et description'],
      },
    ],
  },
  {
    id: 'libraries',
    title: 'Bibliotheques',
    icon: 'library-outline',
    items: [
      {
        title: 'Poissons, articles et outils',
        description: 'Ces ecrans donnent une base de consultation simple.',
        steps: ['Ouvrez Poissons pour les fiches especes', 'Consultez Articles pour les conseils', 'Utilisez Outils pour preparer une sortie'],
      },
    ],
  },
];

export function UserGuideScreen({ navigation }: Props) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((current) =>
      current.includes(sectionId) ? current.filter((id) => id !== sectionId) : [...current, sectionId],
    );
  };

  return (
    <Screen padded={false} scroll>
      <AppHeader onBack={navigation.goBack} showBack title="Guide" />
      <View style={styles.content}>
        <Card style={styles.welcomeCard}>
          <BrandLogo color={colors.primary} height={42} width={190} />
          <Text style={styles.welcomeTitle}>Bienvenue sur PechoMax</Text>
          <Text style={styles.bodyText}>Un guide rapide pour comprendre les parcours principaux de l app.</Text>
        </Card>

        {guideSections.map((section) => {
          const expanded = expandedSections.includes(section.id);
          return (
            <Card key={section.id} style={styles.sectionCard}>
              <Pressable accessibilityRole="button" onPress={() => toggleSection(section.id)} style={styles.sectionHeader}>
                <View style={styles.iconBox}>
                  <Ionicons name={section.icon} size={22} color={colors.secondary} />
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
              </Pressable>
              {expanded ? (
                <View style={styles.expanded}>
                  {section.items.map((item) => (
                    <View key={item.title} style={styles.guideItem}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.bodyText}>{item.description}</Text>
                      {item.steps.map((step) => (
                        <View key={step} style={styles.stepRow}>
                          <Ionicons name="checkmark-circle-outline" size={17} color={colors.primary} />
                          <Text style={styles.stepText}>{step}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              ) : null}
            </Card>
          );
        })}

        <Card style={styles.helpCard}>
          <SectionTitle icon="help-circle-outline" title="Besoin d aide ?" />
          <Text style={styles.bodyText}>Consultez la FAQ ou ouvrez le contact pour obtenir de l aide.</Text>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  welcomeCard: {
    alignItems: 'center',
    gap: spacing.md,
  },
  welcomeTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 22,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  bodyText: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 21,
  },
  sectionCard: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: opacity.secondary10,
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  sectionTitle: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 16,
    fontWeight: typography.weights.bold,
  },
  expanded: {
    borderTopColor: opacity.black08,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  guideItem: {
    gap: spacing.sm,
  },
  itemTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.weights.bold,
  },
  stepRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stepText: {
    color: colors.textMuted,
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  helpCard: {
    backgroundColor: opacity.primary10,
  },
});
