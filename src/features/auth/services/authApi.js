import { API_ENDPOINTS, withQuery } from '../../../services/apiEndpoints';
import { requestAPI } from '../../../services/apiClient';

export const loginAPI = credentials => requestAPI(API_ENDPOINTS.auth.login, {
	method: 'POST',
	skipAuth: true,
	body: JSON.stringify(credentials),
});

export const registerAPI = userData => requestAPI(API_ENDPOINTS.auth.register, {
	method: 'POST',
	skipAuth: true,
	body: JSON.stringify(userData),
});

export const googleLoginAPI = idToken => requestAPI(API_ENDPOINTS.auth.googleLogin, {
	method: 'POST',
	skipAuth: true,
	body: JSON.stringify({ idToken }),
});

export const googleRegisterAPI = idToken => requestAPI(API_ENDPOINTS.auth.googleRegister, {
	method: 'POST',
	skipAuth: true,
	body: JSON.stringify({ idToken }),
});

export const forgotPasswordAPI = email => requestAPI(API_ENDPOINTS.auth.forgotPassword, {
	method: 'POST',
	skipAuth: true,
	body: JSON.stringify({ email }),
});

export const resetPasswordAPI = resetRequest => requestAPI(API_ENDPOINTS.auth.resetPassword, {
	method: 'POST',
	skipAuth: true,
	body: JSON.stringify(resetRequest),
});

export const fetchSecurityLogsAPI = params =>
	requestAPI(withQuery(API_ENDPOINTS.securityLogs.root, params));
export const fetchSecurityLogsPageAPI = params =>
	requestAPI(withQuery(API_ENDPOINTS.securityLogs.root, params), { preservePage: true });
export const getCurrentUserAPI = () => requestAPI(API_ENDPOINTS.users.me);

export const logoutAPI = () => requestAPI(API_ENDPOINTS.auth.logout, { method: 'POST' });
