import { API_ENDPOINTS } from '../../../services/apiEndpoints';
import { requestAPI } from '../../../services/apiClient';

export const fetchCartAPI = () => requestAPI(API_ENDPOINTS.cart.root);
export const addCartItemAPI = (productId, quantity) => requestAPI(API_ENDPOINTS.cart.items, {
	method: 'POST',
	body: JSON.stringify({ productId, quantity }),
});
export const updateCartItemAPI = (productId, quantity) => requestAPI(API_ENDPOINTS.cart.items, {
	method: 'PUT',
	body: JSON.stringify({ productId, quantity }),
});
export const removeCartItemAPI = (productId) =>
	requestAPI(API_ENDPOINTS.cart.item(productId), { method: 'DELETE' });
export const clearCartAPI = () => requestAPI(API_ENDPOINTS.cart.root, { method: 'DELETE' });
