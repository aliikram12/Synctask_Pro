import api from './api';

export const fetchNotifications = (page = 1) =>
  api.get('/notifications', { params: { page } });

export const markNotificationRead = (id) =>
  api.put(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  api.put('/notifications/read-all');
