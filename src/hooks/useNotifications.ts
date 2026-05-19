import { useCallback, useEffect, useMemo, useState } from 'react';
import { getNotifications } from '../services/notificationService';
import { EntityId, NotificationItem } from '../types/domain';

type NotificationsState = {
  data: NotificationItem[];
  loading: boolean;
  error: string | null;
};

export function useNotifications() {
  const [state, setState] = useState<NotificationsState>({ data: [], loading: true, error: null });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const notifications = await getNotifications();
      setState({ data: notifications, loading: false, error: null });
    } catch {
      setState({ data: [], loading: false, error: 'Impossible de charger les notifications.' });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unreadCount = useMemo(() => state.data.filter((item) => !item.read).length, [state.data]);

  const markAsRead = useCallback((notificationId: EntityId) => {
    setState((current) => ({
      ...current,
      data: current.data.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item,
      ),
    }));
  }, []);

  const markAllAsRead = useCallback(() => {
    setState((current) => ({
      ...current,
      data: current.data.map((item) => ({ ...item, read: true })),
    }));
  }, []);

  return { ...state, markAllAsRead, markAsRead, refresh, unreadCount };
}
