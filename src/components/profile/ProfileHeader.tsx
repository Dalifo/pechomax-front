import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows, spacing } from '../../theme/theme';
import { ProfileStat, UserProfile } from '../../types/profile';

type ProfileHeaderProps = {
  profile: Pick<UserProfile, 'displayName' | 'headline' | 'level' | 'stats'>;
  onEditProfile: () => void;
};

function StatCard({ stat }: { stat: ProfileStat }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={stat.icon} size={20} color={colors.surface} />
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
  );
}

export function ProfileHeader({ profile, onEditProfile }: ProfileHeaderProps) {
  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={[styles.waterCircle, styles.waterCircleLeft]} />
      <View style={[styles.waterCircle, styles.waterCircleRight]} />

      <View style={styles.identity}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>PM</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{profile.level}</Text>
          </View>
        </View>

        <Text style={styles.name}>{profile.displayName}</Text>
        <Text style={styles.headline}>{profile.headline}</Text>

        <Pressable
          accessibilityRole="button"
          onPress={onEditProfile}
          style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
        >
          <Text style={styles.editText}>Modifier le profil</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        {profile.stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    overflow: 'hidden',
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
  },
  waterCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: radius.round,
    position: 'absolute',
  },
  waterCircleLeft: {
    height: 190,
    left: -58,
    top: 28,
    width: 190,
  },
  waterCircleRight: {
    bottom: -80,
    height: 220,
    right: -92,
    width: 220,
  },
  identity: {
    alignItems: 'center',
    zIndex: 1,
  },
  avatarWrap: {
    marginBottom: spacing.lg,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.round,
    height: 96,
    justifyContent: 'center',
    width: 96,
    ...shadows.card,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '900',
  },
  levelBadge: {
    alignItems: 'center',
    backgroundColor: colors.warning,
    borderColor: colors.surface,
    borderRadius: radius.round,
    borderWidth: 3,
    bottom: -2,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    right: -3,
    width: 34,
  },
  levelText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '900',
  },
  name: {
    color: colors.surface,
    fontSize: 25,
    fontWeight: '900',
    marginBottom: 4,
  },
  headline: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderColor: 'rgba(255, 255, 255, 0.34)',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: 13,
  },
  editText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
    zIndex: 1,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    minHeight: 96,
    padding: spacing.md,
  },
  statValue: {
    color: colors.surface,
    fontSize: 21,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
  },
});
