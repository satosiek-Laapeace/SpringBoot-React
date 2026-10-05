import { API_ENDPOINTS, withQuery } from '../../../services/apiEndpoints';
import { requestAPI } from '../../../services/apiClient';

export const fetchOrdersAPI = (params) => requestAPI(withQuery(API_ENDPOINTS.orders.root, params));
export const fetchMyOrdersAPI = (params) => requestAPI(withQuery(API_ENDPOINTS.orders.mine, params));
export const fetchMySellerOrdersAPI = () => requestAPI(API_ENDPOINTS.orders.sellerMine);
export const fetchBuyerOrdersAPI = (buyerId, params) =>
	requestAPI(withQuery(API_ENDPOINTS.orders.byBuyer(buyerId), params));
export const fetchOrderAPI = (id) => requestAPI(API_ENDPOINTS.orders.byId(id));
export const createOrderAPI = async (order) => {
	let result = await requestAPI(API_ENDPOINTS.orders.root, {
		method: 'POST',
		body: JSON.stringify(order),
	});

	while (result && typeof result === 'object' && result.id == null && result.orderId == null
		&& result.data && typeof result.data === 'object') {
		result = result.data;
	}

	return result;
};
export const updateOrderStatusAPI = (id, status) => requestAPI(withQuery(API_ENDPOINTS.orders.status(id), { status }), {
	method: 'PUT',
});
export const cancelOrderAPI = (id) => requestAPI(API_ENDPOINTS.orders.byId(id), { method: 'DELETE' });
