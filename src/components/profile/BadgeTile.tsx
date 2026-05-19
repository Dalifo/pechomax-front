import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, opacity, radius, spacing, typography } from '../../theme/theme';
import { Badge, BadgeRarity, IconName } from '../../types/profile';

const rarityTint: Record<BadgeRarity, string> = {
  common: colors.secondary,
  rare: colors.primary,
  epic: colors.earth,
  legendary: colors.earth,
};

type BadgeTileProps = {
  badge: Badge;
  onPress: (badge: Badge) => void;
  selected: boolean;
};

export function BadgeTile({ badge, onPress, selected }: BadgeTileProps) {
  const tint = rarityTint[badge.rarity];
  const icon = badge.icon as IconName;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!badge.unlocked}
      onPress={() => onPress(badge)}
      style={({ pressed }) => [
        styles.tile,
        badge.unlocked ? styles.unlocked : styles.locked,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      {badge.unlocked ? <View style={[styles.rarityWash, { backgroundColor: tint }]} /> : null}
      <Ionicons name={badge.unlocked ? icon : 'lock-closed-outline'} size={30} color={badge.unlocked ? colors.secondary : colors.textSoft} />
      <Text numberOfLines={2} style={styles.name}>{badge.name}</Text>
      {badge.unlocked && badge.rarity !== 'common' ? <Ionicons name="sparkles-outline" size={12} color={colors.earth} style={styles.sparkle} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    borderRadius: radius.lg,
    flexBasis: '31%',
    flexGrow: 1,
    minHeight: 104,
    overflow: 'hidden',
    padding: spacing.md,
  },
  unlocked: {
    backgroundColor: colors.muted,
  },
  locked: {
    backgroundColor: opacity.black06,
    opacity: 0.56,
  },
  selected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  rarityWash: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
  name: {
    color: colors.textMuted,
    fontFamily: typography.fontFamilyBold,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    lineHeight: 13,
    marginTop: spacing.sm,
    textAlign: 'center',
    zIndex: 1,
  },
  sparkle: {
    position: 'absolute',
    right: 8,
    top: 6,
  },
});
