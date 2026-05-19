import { PropsWithChildren } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, opacity, radius, shadows, spacing } from '../../theme/theme';

type CardProps = PropsWithChildren<{
  accessibilityLabel?: string;
  elevated?: boolean;
  onPress?: PressableProps['onPress'];
  padding?: keyof typeof spacing | number;
  style?: StyleProp<ViewStyle>;
}>;

export function Card({
  accessibilityLabel,
  children,
  elevated = false,
  onPress,
  padding = 'lg',
  style,
}: CardProps) {
  const resolvedPadding = typeof padding === 'number' ? padding : spacing[padding];
  const cardStyle = [styles.base, elevated && shadows.soft, { padding: resolvedPadding }, style];

  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderColor: opacity.black08,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
});
