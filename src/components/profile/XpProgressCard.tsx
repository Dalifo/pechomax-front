import { StyleSheet, Text, View } from 'react-native';
import { colors, opacity, radius, spacing, typography } from '../../theme/theme';

type XpProgressCardProps = {
  level: number;
  currentXp: number;
  nextLevelXp: number;
};

export function XpProgressCard({ level, currentXp, nextLevelXp }: XpProgressCardProps) {
  const percent = Math.min(currentXp / nextLevelXp, 1);
  const remaining = Math.max(nextLevelXp - currentXp, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.level}>Niveau {level}</Text>
        <Text style={styles.xp}>
          {currentXp.toLocaleString('fr-FR')} / {nextLevelXp.toLocaleString('fr-FR')} XP
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent * 100}%` }]} />
      </View>

      <Text style={styles.help}>Encore {remaining.toLocaleString('fr-FR')} XP pour le niveau {level + 1}.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  level: {
    color: colors.textMuted,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  xp: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  track: {
    backgroundColor: opacity.black12,
    borderRadius: radius.round,
    height: 12,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    height: '100%',
  },
  help: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    marginTop: spacing.sm,
  },
});
