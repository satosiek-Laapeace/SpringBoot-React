import { API_ENDPOINTS } from '../../../services/apiEndpoints';
import { requestAPI } from '../../../services/apiClient';

export const fetchMarketplaceSettingsAPI = () =>
	requestAPI(API_ENDPOINTS.platformSettings.marketplace);

export const updateMarketplaceSettingsAPI = settings =>
	requestAPI(API_ENDPOINTS.platformSettings.marketplace, {
		method: 'PUT',
		body: JSON.stringify(settings),
	});
