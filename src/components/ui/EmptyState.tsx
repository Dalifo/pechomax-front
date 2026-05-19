import { Ionicons } from '@expo/vector-icons';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, opacity, radius, spacing, typography } from '../../theme/theme';
import { IconName } from '../../types/profile';
import { Button } from './Button';

type EmptyStateProps = {
  actionLabel?: string;
  description?: string;
  icon?: IconName;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
  title: string;
};

export function EmptyState({
  actionLabel,
  description,
  icon = 'fish-outline',
  onActionPress,
  style,
  title,
}: EmptyStateProps) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={34} color={colors.secondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onActionPress ? (
        <Button
          accessibilityLabel={actionLabel}
          onPress={onActionPress}
          size="md"
          style={styles.button}
          title={actionLabel}
          variant="primary"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 240,
    padding: spacing.xxl,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: opacity.secondary10,
    borderRadius: radius.round,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 72,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 20,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  description: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.xl,
  },
});
