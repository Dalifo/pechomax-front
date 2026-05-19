import { Ionicons } from '@expo/vector-icons';
import { Pressable, PressableProps, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, opacity, radius, spacing, typography } from '../../theme/theme';
import { IconName } from '../../types/profile';
import { Avatar } from './Avatar';
import { Badge, BadgeTone } from './Badge';

type ListItemProps = {
  accessibilityLabel?: string;
  avatarInitials?: string;
  badgeLabel?: string;
  badgeTone?: BadgeTone;
  chevron?: boolean;
  icon?: IconName;
  meta?: string;
  onPress?: PressableProps['onPress'];
  style?: StyleProp<ViewStyle>;
  subtitle?: string;
  title: string;
};

export function ListItem({
  accessibilityLabel,
  avatarInitials,
  badgeLabel,
  badgeTone = 'primary',
  chevron = true,
  icon,
  meta,
  onPress,
  style,
  subtitle,
  title,
}: ListItemProps) {
  const content = (
    <>
      {avatarInitials ? <Avatar initials={avatarInitials} size="md" /> : null}
      {!avatarInitials && icon ? (
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={19} color={colors.secondary} />
        </View>
      ) : null}
      <View style={styles.textCol}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title}>{title}</Text>
          {meta ? <Text numberOfLines={1} style={styles.meta}>{meta}</Text> : null}
        </View>
        {subtitle ? <Text numberOfLines={2} style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {badgeLabel ? <Badge label={badgeLabel} tone={badgeTone} /> : null}
      {chevron ? <Ionicons name="chevron-forward" size={18} color={colors.textSoft} /> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.row, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: opacity.black08,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 64,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.72,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: opacity.secondary10,
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  textCol: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.weights.bold,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 17,
  },
});
