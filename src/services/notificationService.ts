import { NotificationItem, ServiceResult } from '../types/domain';

const delay = 160;

const fallbackNotifications: NotificationItem[] = [
  { id: 'notification-1', type: 'like', actor: 'Sophie Martin', content: 'a aime votre prise', timeLabel: 'Il y a 5 min', read: false },
  { id: 'notification-2', type: 'comment', actor: 'Marc Dubois', content: 'a commente votre post', timeLabel: 'Il y a 15 min', read: false },
  { id: 'notification-3', type: 'follow', actor: 'Thomas Laurent', content: 'a commence a vous suivre', timeLabel: 'Il y a 1h', read: false },
  { id: 'notification-4', type: 'spot', actor: 'Julie Chen', content: 'a ajoute un spot pres de vous', timeLabel: 'Il y a 2h', read: true },
  { id: 'notification-5', type: 'badge', actor: 'Systeme', content: 'Vous avez debloque un nouveau badge', timeLabel: 'Hier', read: true },
];

export function getNotifications(): ServiceResult<NotificationItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(fallbackNotifications), delay);
  });
}
