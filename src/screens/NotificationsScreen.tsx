import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { Screen } from '../components/layout/Screen';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { useNotifications } from '../hooks/useNotifications';
import { RootStackParamList } from '../navigation/types';
import { colors, opacity, radius, spacing, typography } from '../theme/theme';
import { NotificationItem } from '../types/domain';
import { IconName } from '../types/profile';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

const iconByType: Record<NotificationItem['type'], IconName> = {
  badge: 'trophy-outline',
  comment: 'chatbubble-outline',
  follow: 'person-add-outline',
  like: 'heart-outline',
  spot: 'location-outline',
};

const toneByType: Record<NotificationItem['type'], string> = {
  badge: colors.earth,
  comment: colors.secondary,
  follow: colors.secondary,
  like: colors.earth,
  spot: colors.primary,
};

export function NotificationsScreen({ navigation }: Props) {
  const { data, loading, markAllAsRead, markAsRead, unreadCount } = useNotifications();

  const openNotification = (notification: NotificationItem) => {
    markAsRead(notification.id);

    if (notification.type === 'like' || notification.type === 'comment') {
      if (notification.targetId) {
        navigation.navigate('PostDetail', { postId: notification.targetId });
      }
      return;
    }

    if (notification.type === 'follow') {
      if (notification.targetId) {
        navigation.navigate('UserProfile', { userId: notification.targetId });
      }
      return;
    }

    if (notification.type === 'spot') {
      if (notification.targetId) {
        navigation.navigate('SpotDetail', { spotId: notification.targetId });
      }
      return;
    }

    navigation.navigate('MainTabs', { screen: 'Profile' });
  };

  return (
    <Screen padded={false} scroll>
      <AppHeader onBack={navigation.goBack} showBack subtitle={`${unreadCount} non lues`} title="Notifications" />
      <View style={styles.markAllBar}>
        <Pressable accessibilityRole="button" onPress={markAllAsRead} style={styles.markAllButton}>
          <Ionicons name="checkmark-circle-outline" size={17} color={colors.primary} />
          <Text style={styles.markAllText}>Marquer toutes comme lues</Text>
        </Pressable>
      </View>
      <View style={styles.content}>
        {loading ? <EmptyState description="Chargement des notifications." icon="notifications-outline" title="Chargement" /> : null}
        {!loading && data.length === 0 ? (
          <EmptyState description="Les nouvelles activites apparaitront ici." icon="notifications-outline" title="Aucune notification" />
        ) : null}
        {!loading && data.map((notification) => (
          <Card
            accessibilityLabel={`Ouvrir la notification ${notification.content}`}
            key={notification.id}
            onPress={() => openNotification(notification)}
            style={[styles.notificationCard, !notification.read && styles.notificationUnread]}
          >
            <View style={[styles.iconBox, { backgroundColor: toneByType[notification.type] }]}>
              <Ionicons name={iconByType[notification.type]} size={20} color={colors.background} />
            </View>
            <View style={styles.textFill}>
              <Text style={styles.notificationText}>
                <Text style={styles.actor}>{notification.actor} </Text>
                {notification.content}
              </Text>
              <Text style={styles.muted}>{notification.timeLabel}</Text>
            </View>
            {!notification.read ? <View style={styles.unreadDot} /> : null}
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  markAllBar: {
    backgroundColor: colors.surface,
    borderBottomColor: opacity.black08,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  markAllButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  markAllText: {
    color: colors.primary,
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  content: {
    gap: spacing.md,
    padding: spacing.xxl,
  },
  notificationCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  notificationUnread: {
    borderColor: opacity.primary36,
    borderWidth: 1,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: radius.round,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  textFill: {
    flex: 1,
    minWidth: 0,
  },
  notificationText: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
  },
  actor: {
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.weights.bold,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  unreadDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    height: 9,
    width: 9,
  },
});
