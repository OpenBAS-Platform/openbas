import { simpleCall, simpleDelCall, simplePostCall, simplePutCall } from '../../utils/Action';
import { Filter, FilterGroup, type NotificationInput } from '../../utils/api-types';

export const NOTIFICATION_URI = '/api/notifications';

const NOTIFIER_EMAIL = '439090d4-52cd-4c52-8b94-da4f808c0e46';

export const createNotification = (input: NotificationInput) => {
  return simplePostCall(`${NOTIFICATION_URI}`, input);
};

export const notification = (notificationId: string) => {
  return simpleCall(`${NOTIFICATION_URI}/${notificationId}`);
};

export const notifications = (filterGroup: FilterGroup) => {
  return simplePostCall(`${NOTIFICATION_URI}/filters`, filterGroup);
};

export const updateNotification = (notificationId: string, input: NotificationInput) => {
  return simplePutCall(`${NOTIFICATION_URI}/${notificationId}`, input);
};

export const deleteNotification = (notificationId: string) => {
  return simpleDelCall(`${NOTIFICATION_URI}/${notificationId}`);
};

// -- UTILS --

export const createEmailNotification = (entityId: string, name: string) => {
  const input: NotificationInput = {
    notification_event_types: ['DATA_UPDATE_SUCCESS'],
    notification_filter: {
      filters: [{
        key: 'entity_id',
        values: [entityId],
      }] as Filter[],
    } as FilterGroup,
    notification_name: name,
    notification_outcomes: [NOTIFIER_EMAIL],
  };
  return createNotification(input);
};

export const findNotificationsByFilter = (entityId: string) => {
  const input: FilterGroup = {
    filters: [{
      key: 'entity_id',
      values: [entityId],
    }] as Filter[],
    mode: 'and',
  };
  return notifications(input);
};
