import { API_ENDPOINTS, withQuery } from '../../../services/apiEndpoints';
import { requestAPI, requestAllPagesAPI } from '../../../services/apiClient';

export const fetchMyReviewsAPI = (params) => requestAPI(withQuery(API_ENDPOINTS.reviews.mine, params));
export const fetchAllMyReviewsAPI = (params = {}) => requestAllPagesAPI(
	({ page, size }) => requestAPI(withQuery(API_ENDPOINTS.reviews.mine, { ...params, page, size })),
);
export const fetchReviewAPI = (id) => requestAPI(API_ENDPOINTS.reviews.byId(id));
export const fetchProductReviewsAPI = (productId, params) =>
	requestAPI(withQuery(API_ENDPOINTS.reviews.byProduct(productId), params));
export const fetchAllProductReviewsAPI = (productId, params = {}) => requestAllPagesAPI(
	({ page, size }) => requestAPI(withQuery(API_ENDPOINTS.reviews.byProduct(productId), { ...params, page, size })),
);
export const fetchProductReviewSummaryAPI = (productId) =>
	requestAPI(API_ENDPOINTS.reviews.productSummary(productId));
export const createReviewAPI = (review) => requestAPI(API_ENDPOINTS.reviews.root, {
	method: 'POST',
	body: JSON.stringify(review),
});
export const updateReviewAPI = (id, review) => requestAPI(API_ENDPOINTS.reviews.byId(id), {
	method: 'PUT',
	body: JSON.stringify(review),
});
export const deleteReviewAPI = (id) => requestAPI(API_ENDPOINTS.reviews.byId(id), { method: 'DELETE' });
