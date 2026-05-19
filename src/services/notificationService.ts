import { NotificationItem, ServiceResult } from '../types/domain';

// TODO(backend): no notification endpoint exists in pechomax-backend/apps/server.
// Deprecated fallback kept so the notifications screen can render non-critical content.
const delay = 160;

const fallbackNotifications: NotificationItem[] = [
  { id: 'fallback-notification-1', type: 'like', actor: 'Sophie Martin', content: 'a aime votre prise', timeLabel: 'Il y a 5 min', read: false, targetId: 'fallback-post-1' },
  { id: 'fallback-notification-2', type: 'comment', actor: 'Marc Dubois', content: 'a commente votre post', timeLabel: 'Il y a 15 min', read: false, targetId: 'fallback-post-2' },
  { id: 'fallback-notification-3', type: 'follow', actor: 'Thomas Laurent', content: 'a commence a vous suivre', timeLabel: 'Il y a 1h', read: false, targetId: 'fallback-user-3' },
  { id: 'fallback-notification-4', type: 'spot', actor: 'Julie Chen', content: 'a ajoute un spot pres de vous', timeLabel: 'Il y a 2h', read: true, targetId: 'fallback-spot-4' },
  { id: 'fallback-notification-5', type: 'badge', actor: 'Systeme', content: 'Vous avez debloque un nouveau badge', timeLabel: 'Hier', read: true },
];

export function getNotifications(): ServiceResult<NotificationItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(fallbackNotifications), delay);
  });
}
