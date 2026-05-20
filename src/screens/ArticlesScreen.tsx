import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { useArticles } from '../hooks/useArticles';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { Article } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'Articles'>;

const categories = ['Tous', 'Technique', 'Materiel', 'Spots', 'Reglementation'];

export function ArticlesScreen({ navigation }: Props) {
  const [category, setCategory] = useState('Tous');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const { filteredArticles, loading, toggleSaved } = useArticles(category);
  const showUnavailable = () => {
    Alert.alert('Fonction bientot disponible', 'Cette action sera ajoutee prochainement.');
  };

  if (selectedArticle) {
    return (
      <Screen padded={false} scroll>
        <AppHeader
          action={
            <IconButton
              accessibilityLabel="Enregistrer l'article"
              icon={selectedArticle.saved ? 'bookmark' : 'bookmark-outline'}
              onPress={() => toggleSaved(selectedArticle.id)}
              variant={selectedArticle.saved ? 'primary' : 'soft'}
            />
          }
          onBack={() => setSelectedArticle(null)}
          showBack
          title="Article"
        />
        <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.articleHero}>
          <Ionicons name="newspaper-outline" size={58} color={colors.background} />
        </LinearGradient>
        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <Badge label={selectedArticle.category} tone="primary" />
            <Text style={styles.muted}>{selectedArticle.dateLabel}</Text>
          </View>
          <Text style={styles.detailTitle}>{selectedArticle.title}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={15} color={colors.textMuted} />
            <Text style={styles.muted}>{selectedArticle.author}</Text>
            <Ionicons name="time-outline" size={15} color={colors.textMuted} />
            <Text style={styles.muted}>{selectedArticle.readTime}</Text>
          </View>
          <Text style={styles.bodyText}>{selectedArticle.excerpt}</Text>
          <Card style={styles.tipCard}>
            <Text style={styles.cardTitle}>Conseil PechoMax</Text>
            <Text style={styles.bodyText}>Verifiez toujours les conditions locales, la reglementation et l acces au spot avant de partir.</Text>
          </Card>
          <Button iconLeft="share-outline" onPress={showUnavailable} title="Partager cet article" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false} scroll>
      <AppHeader onBack={navigation.goBack} showBack subtitle="Guides, techniques et actualites" title="Articles" />
      <View style={styles.content}>
        <LinearGradient colors={[colors.secondary, colors.primary]} style={styles.featured}>
          <Text style={styles.featuredKicker}>A LA UNE</Text>
          <Text style={styles.featuredTitle}>Guide complet saison 2026</Text>
          <Text style={styles.featuredText}>Les bases pour preparer vos prochaines sorties.</Text>
        </LinearGradient>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {categories.map((item) => {
              const active = item === category;
              return (
                <Pressable key={item} onPress={() => setCategory(item)} style={[styles.filterChip, active && styles.filterChipActive]}>
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {loading ? <EmptyState description="Chargement des articles." icon="newspaper-outline" title="Chargement" /> : null}
        {!loading && filteredArticles.map((article) => (
          <Card key={article.id} onPress={() => setSelectedArticle(article)} style={styles.articleCard}>
            <View style={styles.articleThumb}>
              <Ionicons name="newspaper-outline" size={26} color={colors.secondary} />
            </View>
            <View style={styles.textFill}>
              <View style={styles.badgeRowCompact}>
                <Badge label={article.category} tone="secondary" />
                <Text style={styles.muted}>{article.readTime}</Text>
              </View>
              <Text numberOfLines={2} style={styles.articleTitle}>{article.title}</Text>
              <Text numberOfLines={2} style={styles.muted}>{article.excerpt}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.muted}>{article.author}</Text>
                <Text style={styles.muted}>{article.views} vues</Text>
              </View>
            </View>
            <IconButton
              accessibilityLabel="Enregistrer"
              icon={article.saved ? 'bookmark' : 'bookmark-outline'}
              onPress={() => toggleSaved(article.id)}
              size="sm"
              variant={article.saved ? 'primary' : 'soft'}
            />
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  featured: {
    borderRadius: radius.xl,
    gap: spacing.sm,
    padding: spacing.xxl,
  },
  featuredKicker: {
    color: opacity.surface88,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  featuredTitle: {
    color: colors.background,
    fontFamily: typography.fontFamilyBold,
    fontSize: 23,
    fontWeight: typography.weights.bold,
  },
  featuredText: {
    color: opacity.surface88,
    fontFamily: typography.fontFamily,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    backgroundColor: opacity.black06,
    borderRadius: radius.round,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.secondary,
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
  articleCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  articleThumb: {
    alignItems: 'center',
    backgroundColor: opacity.secondary10,
    borderRadius: radius.md,
    height: 74,
    justifyContent: 'center',
    width: 74,
  },
  textFill: {
    flex: 1,
    minWidth: 0,
  },
  badgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badgeRowCompact: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  articleTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  articleHero: {
    alignItems: 'center',
    height: 210,
    justifyContent: 'center',
  },
  detailTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 27,
    fontWeight: typography.weights.bold,
    lineHeight: 34,
  },
  bodyText: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 21,
  },
  tipCard: {
    backgroundColor: opacity.primary10,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
});
