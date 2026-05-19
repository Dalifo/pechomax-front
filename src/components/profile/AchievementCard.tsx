import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme/theme';
import { Achievement } from '../../types/profile';

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <View style={styles.card}>
      <Ionicons name={achievement.icon} size={20} color={achievement.color} />
      <Text style={styles.value}>{achievement.value}</Text>
      <Text style={styles.label}>{achievement.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.muted,
    borderRadius: radius.lg,
    flex: 1,
    minHeight: 94,
    padding: spacing.md,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  label: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 13,
    marginTop: 4,
    textAlign: 'center',
  },
});
