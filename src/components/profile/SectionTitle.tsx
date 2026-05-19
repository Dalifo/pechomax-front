import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/theme';
import { IconName } from '../../types/profile';

type SectionTitleProps = {
  title: string;
  icon?: IconName;
  iconColor?: string;
  trailing?: string;
};

export function SectionTitle({ title, icon, iconColor = colors.primary, trailing }: SectionTitleProps) {
  return (
    <View style={styles.row}>
      <View style={styles.titleRow}>
        {icon ? <Ionicons name={icon} size={16} color={iconColor} /> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {trailing ? <Text style={styles.trailing}>{trailing}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  trailing: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
});
