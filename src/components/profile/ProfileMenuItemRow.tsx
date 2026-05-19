import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows, spacing } from '../../theme/theme';
import { ProfileMenuItem } from '../../types/profile';

type ProfileMenuItemRowProps = {
  item: ProfileMenuItem;
  onPress?: () => void;
};

export function ProfileMenuItemRow({ item, onPress }: ProfileMenuItemRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.iconBox}>
        <Ionicons name={item.icon} size={18} color={colors.textMuted} />
      </View>
      <Text style={styles.label}>{item.label}</Text>
      {typeof item.count === 'number' ? (
        <View style={styles.count}>
          <Text style={styles.countText}>{item.count}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color={colors.textSoft} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 68,
    padding: spacing.lg,
    ...shadows.soft,
  },
  pressed: {
    opacity: 0.72,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: colors.muted,
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  label: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  count: {
    backgroundColor: 'rgba(53, 180, 163, 0.10)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  countText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
});
