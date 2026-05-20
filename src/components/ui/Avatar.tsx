import { useEffect, useState } from 'react';
import { Image, ImageSourcePropType, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/theme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

type AvatarProps = {
  initials?: string;
  label?: string;
  size?: AvatarSize;
  source?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
};

const sizes: Record<AvatarSize, { box: number; text: number }> = {
  sm: { box: 32, text: 12 },
  md: { box: 44, text: 15 },
  lg: { box: 58, text: 19 },
  xl: { box: 88, text: 28 },
};

export function Avatar({ initials = 'PM', label, size = 'md', source, style }: AvatarProps) {
  const metrics = sizes[size];
  const [imageFailed, setImageFailed] = useState(false);
  const displayInitials = initials
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    setImageFailed(false);
  }, [source]);

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole={label ? 'image' : undefined}
      style={[styles.base, { height: metrics.box, width: metrics.box }, style]}
    >
      {source && !imageFailed ? (
        <Image onError={() => setImageFailed(true)} source={source} style={styles.image} />
      ) : (
        <Text style={[styles.initials, { fontSize: metrics.text }]}>{displayInitials || 'PM'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.round,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: spacing.xs,
  },
  image: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  initials: {
    color: colors.background,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.weights.bold,
  },
});
