import { Ionicons } from '@expo/vector-icons';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../../theme/theme';
import { IconName } from '../../types/profile';

type SectionTitleProps = {
  action?: React.ReactNode;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  subtitle?: string;
  title: string;
  titleStyle?: StyleProp<TextStyle>;
};

export function SectionTitle({ action, icon, style, subtitle, title, titleStyle }: SectionTitleProps) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.textWrap}>
        <View style={styles.titleRow}>
          {icon ? <Ionicons name={icon} size={17} color={colors.secondary} /> : null}
          <Text style={[styles.title, titleStyle]}>{title}</Text>
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 17,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    marginTop: 2,
  },
});
