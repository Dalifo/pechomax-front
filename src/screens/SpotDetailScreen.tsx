import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { SectionTitle } from '../components/ui/SectionTitle';
import { useAuth } from '../hooks/useAuth';
import { useSpotDetail } from '../hooks/useSpotDetail';
import { RootStackParamList } from '../navigation/types';
import {
  addSpotComment,
  deleteSpotComment,
  favoriteSpot,
  getSpotComments,
  rateSpot,
  unfavoriteSpot,
} from '../services/spotService';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { SpotComment } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'SpotDetail'>;

export function SpotDetailScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { data: spot, loading, refresh } = useSpotDetail(route.params.spotId);
  const [comments, setComments] = useState<SpotComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setCommentsLoading(true);
    getSpotComments(route.params.spotId)
      .then((nextComments) => {
        if (active) {
          setComments(nextComments);
          setError(null);
        }
      })
      .catch(() => {
        if (active) {
          setError('Impossible de charger les commentaires du spot.');
        }
      })
      .finally(() => {
        if (active) {
          setCommentsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [route.params.spotId]);

  if (loading || !spot) {
    return (
      <Screen padded={false}>
        <AppHeader onBack={navigation.goBack} showBack title="Spot" />
        <EmptyState description="Chargement du spot." icon="location-outline" title="Chargement" />
      </Screen>
    );
  }

  const toggleFavorite = async () => {
    setActionLoading(true);
    setError(null);

    try {
      if (spot.favorite) {
        await unfavoriteSpot(spot.id);
      } else {
        await favoriteSpot(spot.id);
      }
      await refresh();
    } catch {
      setError('Impossible de modifier ce favori pour le moment.');
    } finally {
      setActionLoading(false);
    }
  };

  const submitRating = async (rating: number) => {
    setActionLoading(true);
    setError(null);

    try {
      await rateSpot(spot.id, rating);
      await refresh();
    } catch {
      setError('Impossible d enregistrer la note.');
    } finally {
      setActionLoading(false);
    }
  };

  const submitComment = async () => {
    const content = commentText.trim();
    if (!content) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const comment = await addSpotComment(spot.id, content);
      setComments((current) => [comment, ...current]);
      setCommentText('');
      await refresh();
    } catch {
      setError('Impossible d ajouter le commentaire.');
    } finally {
      setActionLoading(false);
    }
  };

  const removeComment = async (commentId: string) => {
    setActionLoading(true);
    setError(null);

    try {
      await deleteSpotComment(commentId);
      setComments((current) => current.filter((comment) => comment.id !== commentId));
      await refresh();
    } catch {
      setError('Impossible de supprimer ce commentaire.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Screen padded={false} scroll>
      <AppHeader onBack={navigation.goBack} showBack title={spot.name} titleStyle={styles.headerTitle} />

      {spot.imageUrl ? (
        <Image source={{ uri: spot.imageUrl }} style={styles.heroImage} />
      ) : (
        <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.hero}>
          <Ionicons name="location-outline" size={64} color={opacity.surface88} />
        </LinearGradient>
      )}

      <View style={styles.content}>
        <View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={17} color={colors.textMuted} />
            <Text style={styles.muted}>{spot.location}</Text>
          </View>
          <View style={styles.badgeRow}>
            <Badge label={spot.waterType === 'freshwater' ? 'Eau douce' : 'Mer'} tone="secondary" />
            {spot.rating > 0 ? <Badge label={`${spot.rating.toFixed(1)} / 5`} tone="earth" /> : null}
            <Badge label={`${spot.favoritesCount ?? 0} favoris`} tone="neutral" />
          </View>
        </View>

        <Button
          iconLeft={spot.favorite ? 'heart' : 'heart-outline'}
          loading={actionLoading}
          onPress={toggleFavorite}
          title={spot.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          variant="outline"
        />

        <SectionTitle icon="fish-outline" title="Poissons disponibles" />
        <View style={styles.badgeRow}>
          {spot.fish.length > 0 ? (
            spot.fish.map((fish) => <Badge key={fish} label={fish} tone="secondary" />)
          ) : (
            <Badge label="Especes a confirmer" tone="neutral" />
          )}
        </View>

        {spot.conditions ? (
          <Card>
            <Text style={styles.cardTitle}>Conditions</Text>
            <Text style={styles.bodyText}>{spot.conditions}</Text>
          </Card>
        ) : null}

        <Card style={styles.cardGap}>
          <SectionTitle icon="star-outline" title="Votre note" />
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable accessibilityRole="button" key={value} onPress={() => submitRating(value)} style={styles.starButton}>
                <Ionicons
                  name={(spot.myRating ?? 0) >= value ? 'star' : 'star-outline'}
                  size={28}
                  color={colors.earth}
                />
              </Pressable>
            ))}
          </View>
          <Text style={styles.muted}>
            {spot.rating > 0 ? `${spot.rating.toFixed(1)} / 5 sur ${spot.ratingsCount ?? 0} avis` : 'Aucune note pour le moment'}
          </Text>
        </Card>

        <SectionTitle icon="chatbubble-outline" title={`Commentaires (${comments.length})`} />
        <Card style={styles.cardGap}>
          <Input
            inputStyle={styles.commentInput}
            label="Ajouter un commentaire"
            multiline
            onChangeText={setCommentText}
            placeholder="Partagez une info utile sur ce spot..."
            textAlignVertical="top"
            value={commentText}
          />
          <Button disabled={!commentText.trim()} loading={actionLoading} onPress={submitComment} title="Publier" />
        </Card>

        {commentsLoading ? <EmptyState description="Chargement des commentaires." title="Chargement" /> : null}
        {!commentsLoading && comments.length === 0 ? (
          <EmptyState description="Partagez la premiere information utile sur ce spot." icon="chatbubble-outline" title="Aucun commentaire" />
        ) : null}
        {comments.length > 0 ? (
          <View style={styles.listGap}>
            {comments.map((comment) => (
              <Card key={comment.id} padding="md" style={styles.commentCard}>
                <Avatar
                  initials={comment.author.initials}
                  size="sm"
                  source={comment.author.profilePic ? { uri: comment.author.profilePic } : undefined}
                />
                <View style={styles.textFill}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentName}>{comment.author.name}</Text>
                    {comment.author.id === user?.id ? (
                      <Pressable accessibilityRole="button" onPress={() => removeComment(comment.id)}>
                        <Ionicons name="trash-outline" size={17} color={colors.textMuted} />
                      </Pressable>
                    ) : null}
                  </View>
                  <Text style={styles.bodyText}>{comment.text}</Text>
                  <Text style={styles.muted}>{comment.timeLabel}</Text>
                </View>
              </Card>
            ))}
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          iconLeft="share-outline"
          onPress={() => Share.share({ message: `${spot.name} - ${spot.conditions ?? 'Spot PechoMax'}`, title: spot.name })}
          title="Partager le spot"
          variant="outline"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    height: 190,
    justifyContent: 'center',
  },
  heroImage: {
    height: 220,
    width: '100%',
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  headerTitle: {
    fontSize: 21,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 25,
    fontWeight: typography.weights.bold,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 16,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  bodyText: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  cardGap: {
    gap: spacing.md,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  starButton: {
    padding: spacing.xs,
  },
  commentInput: {
    minHeight: 86,
  },
  listGap: {
    gap: spacing.md,
  },
  commentCard: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  commentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  commentName: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  textFill: {
    flex: 1,
    minWidth: 0,
  },
  errorText: {
    color: colors.danger,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
});
