import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, opacity, spacing, typography } from '../../theme/theme';
import { BrandLogo } from '../brand/BrandLogo';
import { IconButton } from '../ui/IconButton';

type AppHeaderProps = PropsWithChildren<{
  action?: React.ReactNode;
  logo?: boolean;
  onBack?: () => void;
  showBack?: boolean;
  style?: StyleProp<ViewStyle>;
  subtitle?: string;
  title?: string;
}>;

export function AppHeader({
  action,
  children,
  logo = false,
  onBack,
  showBack = false,
  style,
  subtitle,
  title,
}: AppHeaderProps) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.side}>
        {showBack ? (
          <IconButton
            accessibilityLabel="Retour"
            icon="chevron-back"
            onPress={onBack}
            size="md"
            variant="soft"
          />
        ) : null}
      </View>

      <View style={styles.center}>
        {logo ? <BrandLogo color={colors.text} height={28} width={134} /> : null}
        {!logo && title ? <Text numberOfLines={1} style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </View>

      <View style={styles.side}>{action}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderBottomColor: opacity.black08,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  side: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: spacing.sm,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 18,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    marginTop: 2,
  },
});
