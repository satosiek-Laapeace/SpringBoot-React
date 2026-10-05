import { API_ENDPOINTS, withQuery } from '../../../services/apiEndpoints';
import { requestAPI, requestAllPagesAPI } from '../../../services/apiClient';

export const fetchNotificationsAPI = (params) => requestAPI(withQuery(API_ENDPOINTS.notifications.root, params));
export const fetchAllNotificationsAPI = (params = {}) => requestAllPagesAPI(
	({ page, size }) => requestAPI(withQuery(API_ENDPOINTS.notifications.root, { ...params, page, size })),
);
export const fetchUnreadNotificationCountAPI = (userId) =>
	requestAPI(withQuery(API_ENDPOINTS.notifications.unreadCount, { userId }));
export const createNotificationAPI = (notification) => requestAPI(API_ENDPOINTS.notifications.root, {
	method: 'POST',
	body: JSON.stringify(notification),
});
export const markNotificationReadAPI = (id, userId) =>
	requestAPI(withQuery(API_ENDPOINTS.notifications.markRead(id), { userId }), { method: 'PATCH' });
export const markAllNotificationsReadAPI = (userId) =>
	requestAPI(withQuery(API_ENDPOINTS.notifications.readAll, { userId }), { method: 'PATCH' });
export const deleteNotificationAPI = (id, userId) =>
	requestAPI(withQuery(API_ENDPOINTS.notifications.byId(id), { userId }), { method: 'DELETE' });
