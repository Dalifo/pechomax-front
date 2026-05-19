import { Ionicons } from '@expo/vector-icons';
import { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, opacity, radius, spacing, typography } from '../../theme/theme';
import { IconName } from '../../types/profile';

export type ButtonVariant = 'primary' | 'secondary' | 'earth' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = PropsWithChildren<Omit<PressableProps, 'style'>> & {
  accessibilityLabel?: string;
  fullWidth?: boolean;
  iconLeft?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  title?: string;
  variant?: ButtonVariant;
};

const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle; icon: string }> = {
  primary: {
    container: { backgroundColor: colors.primary },
    text: { color: colors.background },
    icon: colors.background,
  },
  secondary: {
    container: { backgroundColor: colors.secondary },
    text: { color: colors.background },
    icon: colors.background,
  },
  earth: {
    container: { backgroundColor: colors.earth },
    text: { color: colors.background },
    icon: colors.background,
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.text },
    icon: colors.text,
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderColor: colors.primary,
      borderWidth: 1,
    },
    text: { color: colors.primary },
    icon: colors.primary,
  },
};

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle; icon: number }> = {
  sm: {
    container: { minHeight: 40, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    text: { fontSize: 13 },
    icon: 17,
  },
  md: {
    container: { minHeight: 48, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
    text: { fontSize: 15 },
    icon: 19,
  },
  lg: {
    container: { minHeight: 56, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
    text: { fontSize: 16 },
    icon: 21,
  },
};

export function Button({
  accessibilityLabel,
  children,
  disabled,
  fullWidth = false,
  iconLeft,
  iconRight,
  loading = false,
  size = 'md',
  style,
  textStyle,
  title,
  variant = 'primary',
  ...pressableProps
}: ButtonProps) {
  const visual = variantStyles[variant];
  const sizing = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        visual.container,
        sizing.container,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...pressableProps}
    >
      {loading ? <ActivityIndicator color={visual.icon} size="small" /> : null}
      {!loading && iconLeft ? <Ionicons name={iconLeft} size={sizing.icon} color={visual.icon} /> : null}
      <View style={styles.labelWrap}>
        {title ? (
          <Text style={[styles.text, visual.text, sizing.text, textStyle]}>{title}</Text>
        ) : (
          children
        )}
      </View>
      {!loading && iconRight ? <Ionicons name={iconRight} size={sizing.icon} color={visual.icon} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.44,
  },
  labelWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.weights.bold,
    letterSpacing: 0,
  },
});
