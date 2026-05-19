import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BrandLogo } from '../components/brand/BrandLogo';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'FAQ'>;

const faqCategories = [
  {
    id: 'general',
    title: 'Questions generales',
    questions: [
      { q: "Qu'est-ce que PechoMax ?", a: 'Une application mobile pour trouver des spots, suivre vos prises et echanger avec d autres pecheurs.' },
      { q: 'L app est-elle gratuite ?', a: 'PechoMax ne contient aucun paiement ni abonnement dans cette version.' },
      { q: 'Dois-je creer un compte ?', a: 'Un compte est necessaire pour publier, echanger et retrouver votre journal.' },
    ],
  },
  {
    id: 'spots',
    title: 'Spots et carte',
    questions: [
      { q: 'Comment trouver un spot ?', a: 'Ouvrez Carte, utilisez la recherche ou les filtres, puis selectionnez un spot.' },
      { q: 'Comment ouvrir un spot ?', a: 'Depuis la carte, selectionnez un marqueur ou une fiche puis ouvrez le detail du spot.' },
    ],
  },
  {
    id: 'community',
    title: 'Communaute',
    questions: [
      { q: 'Comment publier une prise ?', a: 'Utilisez le bouton plus, ajoutez une photo, choisissez une espece et un spot, puis publiez.' },
      { q: 'Les messages sont-ils envoyes ?', a: 'Oui. Les conversations et messages sont envoyes apres connexion.' },
    ],
  },
];

export function FAQScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);

  const filteredCategories = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return faqCategories
      .map((category) => ({
        ...category,
        questions: category.questions.filter((item) =>
          !normalized || item.q.toLowerCase().includes(normalized) || item.a.toLowerCase().includes(normalized),
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [query]);

  const toggle = (key: string) => {
    setExpanded((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  };

  return (
    <Screen padded={false} scroll>
      <AppHeader onBack={navigation.goBack} showBack title="FAQ" />
      <View style={styles.content}>
        <Card style={styles.heroCard}>
          <BrandLogo color={colors.primary} height={34} width={160} />
          <Text style={styles.heroTitle}>Questions frequentes</Text>
          <Text style={styles.muted}>Reponses rapides sur les parcours principaux.</Text>
        </Card>

        <Input iconLeft="search-outline" onChangeText={setQuery} placeholder="Rechercher une question..." value={query} />

        {filteredCategories.length === 0 ? (
          <EmptyState description="Essayez avec un autre mot cle." icon="search-outline" title="Aucun resultat" />
        ) : null}

        {filteredCategories.map((category) => (
          <View key={category.id} style={styles.category}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            {category.questions.map((question, index) => {
              const key = `${category.id}-${index}`;
              const isExpanded = expanded.includes(key);
              return (
                <Card key={key} padding="md" style={styles.questionCard}>
                  <Pressable accessibilityRole="button" onPress={() => toggle(key)} style={styles.questionHeader}>
                    <Text style={styles.question}>{question.q}</Text>
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
                  </Pressable>
                  {isExpanded ? <Text style={styles.answer}>{question.a}</Text> : null}
                </Card>
              );
            })}
          </View>
        ))}

        <Card style={styles.contactCard}>
          <Text style={styles.question}>Pas trouve votre reponse ?</Text>
          <Text style={styles.muted}>Notre equipe reviendra vers vous des que possible.</Text>
          <Button onPress={() => navigation.navigate('Contact')} title="Nous contacter" />
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
  heroCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 22,
    fontWeight: typography.weights.bold,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  category: {
    gap: spacing.md,
  },
  categoryTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 16,
    fontWeight: typography.weights.bold,
  },
  questionCard: {
    gap: spacing.md,
  },
  questionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  question: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
    fontWeight: typography.weights.bold,
  },
  answer: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: opacity.secondary10,
    gap: spacing.md,
  },
});
