import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { useProfile } from '../hooks/useProfile';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { Badge } from '../types/profile';

type Props = NativeStackScreenProps<RootStackParamList, 'Trophies'>;

function BadgeCard({ badge }: { badge: Badge }) {
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
        <Text style={styles.badgeName}>{badge.name}</Text>
        <Text style={styles.badgeMeta}>{badge.unlocked ? 'Debloque' : 'A debloquer avec vos prochaines actions'}</Text>
      </View>
    </Card>
  );
}

export function TrophiesScreen({ navigation }: Props) {
  const { data: profile, loading, refresh } = useProfile();

  return (
    <Screen padded={false} scroll>
      <AppHeader onBack={navigation.goBack} showBack title="Trophees" />
      <View style={styles.content}>
        {loading ? <EmptyState description="Chargement des trophees." icon="trophy-outline" title="Chargement" /> : null}

        {!loading && !profile ? (
          <EmptyState
            actionLabel="Reessayer"
            description="Impossible de charger vos trophees."
            icon="trophy-outline"
            onActionPress={refresh}
            title="Trophees indisponibles"
          />
        ) : null}

        {profile ? (
          <>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{profile.badges.filter((badge) => badge.unlocked).length}/{profile.badges.length}</Text>
              <Text style={styles.summaryLabel}>badges debloques</Text>
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
  badgeName: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.weights.bold,
  },
  badgeMeta: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
});
