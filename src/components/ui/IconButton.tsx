import { Ionicons } from '@expo/vector-icons';
import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { colors, opacity, radius } from '../../theme/theme';
import { IconName } from '../../types/profile';

type IconButtonVariant = 'plain' | 'soft' | 'primary' | 'secondary' | 'earth';
type IconButtonSize = 'sm' | 'md' | 'lg';

type IconButtonProps = Omit<PressableProps, 'style'> & {
  accessibilityLabel: string;
  icon: IconName;
  size?: IconButtonSize;
  style?: StyleProp<ViewStyle>;
  variant?: IconButtonVariant;
};

const sizes: Record<IconButtonSize, { box: number; icon: number }> = {
  sm: { box: 36, icon: 18 },
  md: { box: 44, icon: 21 },
  lg: { box: 52, icon: 24 },
};

const variants: Record<IconButtonVariant, { backgroundColor: string; color: string }> = {
  plain: { backgroundColor: 'transparent', color: colors.text },
  soft: { backgroundColor: opacity.black06, color: colors.text },
  primary: { backgroundColor: colors.primary, color: colors.background },
  secondary: { backgroundColor: colors.secondary, color: colors.background },
  earth: { backgroundColor: colors.earth, color: colors.background },
};

export function IconButton({
  accessibilityLabel,
  disabled,
  icon,
  size = 'md',
  style,
  variant = 'soft',
  ...pressableProps
}: IconButtonProps) {
  const metrics = sizes[size];
  const visual = variants[variant];

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: visual.backgroundColor,
          height: metrics.box,
          width: metrics.box,
        },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...pressableProps}
    >
      <Ionicons name={icon} size={metrics.icon} color={visual.color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.round,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.94 }],
  },
  disabled: {
    opacity: 0.44,
  },
});
