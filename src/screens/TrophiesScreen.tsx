import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge as UiBadge } from '../components/ui/Badge';
import { useProfile } from '../hooks/useProfile';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { Badge } from '../types/profile';

type Props = NativeStackScreenProps<RootStackParamList, 'Trophies'>;

function BadgeCard({ badge }: { badge: Badge }) {
  const hasProgress = typeof badge.progress === 'number' && typeof badge.target === 'number';
  const progress = hasProgress ? Math.min(1, Math.max(0, (badge.progress ?? 0) / Math.max(1, badge.target ?? 1))) : 0;

  return (
    <Card padding="md" style={[styles.badgeCard, !badge.unlocked && styles.badgeLocked]}>
      <View style={[styles.iconBox, badge.unlocked && styles.iconBoxUnlocked]}>
        <Ionicons
          name={badge.unlocked ? badge.icon as keyof typeof Ionicons.glyphMap : 'lock-closed-outline'}
          size={24}
          color={badge.unlocked ? colors.background : colors.textSoft}
        />
      </View>
      <View style={styles.textFill}>
        <View style={styles.badgeHeader}>
          <Text style={styles.badgeName}>{badge.name}</Text>
          {badge.category ? <UiBadge label={badge.category} tone="neutral" /> : null}
        </View>
        {badge.description ? <Text style={styles.badgeDescription}>{badge.description}</Text> : null}
        {badge.condition ? <Text style={styles.badgeMeta}>{badge.condition}</Text> : null}
        {hasProgress ? (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        ) : null}
        <Text style={styles.badgeMeta}>
          {badge.unlocked ? 'Débloqué' : hasProgress ? `${badge.progress}/${badge.target}` : 'À débloquer avec vos prochaines actions'}
        </Text>
      </View>
    </Card>
  );
}

export function TrophiesScreen({ navigation }: Props) {
  const { data: profile, loading, refresh } = useProfile();

  return (
    <Screen padded={false} scroll>
      <AppHeader onBack={navigation.goBack} showBack title="Trophées" />
      <View style={styles.content}>
        {loading ? <EmptyState description="Chargement des trophées." icon="trophy-outline" title="Chargement" /> : null}

        {!loading && !profile ? (
          <EmptyState
            actionLabel="Réessayer"
            description="Impossible de charger vos trophées."
            icon="trophy-outline"
            onActionPress={refresh}
            title="Trophées indisponibles"
          />
        ) : null}

        {profile ? (
          <>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{profile.badges.filter((badge) => badge.unlocked).length}/{profile.badges.length}</Text>
              <Text style={styles.summaryLabel}>badges débloqués</Text>
            </Card>

            <View style={styles.badgeList}>
              {profile.badges.map((badge) => (
                <BadgeCard badge={badge} key={badge.id} />
              ))}
            </View>
          </>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: colors.earth,
    borderWidth: 0,
  },
  summaryValue: {
    color: colors.background,
    fontFamily: typography.fontFamilyBold,
    fontSize: 30,
    fontWeight: typography.weights.bold,
  },
  summaryLabel: {
    color: opacity.surface88,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  badgeList: {
    gap: spacing.md,
  },
  badgeCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  badgeLocked: {
    opacity: 0.68,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: opacity.black06,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  iconBoxUnlocked: {
    backgroundColor: colors.secondary,
  },
  textFill: {
    flex: 1,
    gap: spacing.xs,
  },
  badgeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badgeName: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.weights.bold,
  },
  badgeDescription: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  badgeMeta: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  progressTrack: {
    backgroundColor: opacity.black08,
    borderRadius: radius.round,
    height: 6,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    height: '100%',
  },
});
