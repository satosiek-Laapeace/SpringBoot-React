import { API_ENDPOINTS, withQuery } from '../../../services/apiEndpoints';
import { requestAPI } from '../../../services/apiClient';

export const fetchCurrentUserAPI = () => requestAPI(API_ENDPOINTS.users.me);
export const fetchUserAPI = (id) => requestAPI(API_ENDPOINTS.users.byId(id));
export const fetchUsersAPI = (params) => requestAPI(withQuery(API_ENDPOINTS.users.root, params));
export const createUserAPI = (user) => requestAPI(API_ENDPOINTS.users.root, {
	method: 'POST',
	body: JSON.stringify(user),
});
export const updateUserAPI = (id, user) => requestAPI(API_ENDPOINTS.users.byId(id), {
	method: 'PUT',
	body: JSON.stringify(user),
});
export const updateUserProfileAPI = (id, profile) => requestAPI(API_ENDPOINTS.users.profile(id), {
	method: 'PATCH',
	body: JSON.stringify(profile),
});
export const uploadUserProfilePictureAPI = (id, file) => {
	const formData = new FormData();
	formData.append('file', file);
	return requestAPI(API_ENDPOINTS.users.profilePicture(id), {
		method: 'PUT',
		body: formData,
	});
};
export const deleteUserAPI = (id) => requestAPI(API_ENDPOINTS.users.byId(id), { method: 'DELETE' });
export const updateUserRoleAPI = (id, role) => requestAPI(
	withQuery(API_ENDPOINTS.users.role(id), { role }),
	{ method: 'PATCH' },
);
export const unlockUserAPI = (id) => requestAPI(API_ENDPOINTS.users.unlock(id), { method: 'PATCH' });
export const setUserEnabledAPI = (id, enabled) => requestAPI(
	withQuery(API_ENDPOINTS.users.enabled(id), { enabled }),
	{ method: 'PATCH' },
);

export const fetchAddressesAPI = (params) => requestAPI(withQuery(API_ENDPOINTS.addresses.root, params));
export const fetchAddressAPI = (id) => requestAPI(API_ENDPOINTS.addresses.byId(id));
export const fetchNearbyAddressesAPI = (latitude, longitude, radiusKm = 5) => requestAPI(
	withQuery(API_ENDPOINTS.addresses.nearby, { latitude, longitude, radiusKm }),
);
export const createAddressAPI = (address) => requestAPI(API_ENDPOINTS.addresses.root, {
	method: 'POST',
	body: JSON.stringify(address),
});
export const updateAddressAPI = (id, address) => requestAPI(API_ENDPOINTS.addresses.byId(id), {
	method: 'PUT',
	body: JSON.stringify(address),
});
export const setDefaultAddressAPI = (id) =>
	requestAPI(API_ENDPOINTS.addresses.setDefault(id), { method: 'PATCH' });
export const deleteAddressAPI = (id) => requestAPI(API_ENDPOINTS.addresses.byId(id), { method: 'DELETE' });
