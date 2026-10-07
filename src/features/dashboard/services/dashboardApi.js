import { API_ENDPOINTS } from '../../../services/apiEndpoints';
import { requestAPI } from '../../../services/apiClient';

export const fetchSellerDashboardOverviewAPI = () =>
  requestAPI(API_ENDPOINTS.sellerDashboard.overview);
