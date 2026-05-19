import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { colors, opacity, radius, spacing, typography } from '../../theme/theme';

export type BadgeTone = 'primary' | 'secondary' | 'earth' | 'neutral';

type BadgeProps = PropsWithChildren<{
  label?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  tone?: BadgeTone;
}>;

const toneStyles: Record<BadgeTone, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: opacity.primary10 },
    text: { color: colors.primary },
  },
  secondary: {
    container: { backgroundColor: opacity.secondary10 },
    text: { color: colors.secondary },
  },
  earth: {
    container: { backgroundColor: opacity.earth10 },
    text: { color: colors.earth },
  },
  neutral: {
    container: { backgroundColor: opacity.black06 },
    text: { color: colors.text },
  },
};

export function Badge({ children, label, style, textStyle, tone = 'primary' }: BadgeProps) {
  const toneStyle = toneStyles[tone];

  return (
    <View style={[styles.base, toneStyle.container, style]}>
      {label ? <Text style={[styles.text, toneStyle.text, textStyle]}>{label}</Text> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.round,
    justifyContent: 'center',
    minHeight: 26,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
});
