import { API_ENDPOINTS, withQuery } from '../../../services/apiEndpoints';
import { requestAPI } from '../../../services/apiClient';
import { createOrderAPI } from '../../orders/services/orderApi';

export { createOrderAPI };

export const createCardCheckoutAPI = (orderId) =>
	requestAPI(API_ENDPOINTS.payments.checkout(orderId), { method: 'POST' });
export const createAbaPaywayCheckoutAPI = (orderId) =>
	requestAPI(API_ENDPOINTS.payments.abaPayway(orderId), { method: 'POST' });
export const verifyAbaPaywayPaymentAPI = (orderId) =>
	requestAPI(API_ENDPOINTS.payments.verifyAbaPayway(orderId), { method: 'POST' });
export const createKhqrPaymentAPI = (orderId) =>
	requestAPI(API_ENDPOINTS.payments.khqr(orderId), { method: 'POST' });
export const verifyKhqrPaymentAPI = (orderId) =>
	requestAPI(API_ENDPOINTS.payments.verifyKhqr(orderId), { method: 'POST' });
export const payCashOnDeliveryAPI = (orderId) =>
	requestAPI(API_ENDPOINTS.payments.cod(orderId), { method: 'POST' });
export const payByBankTransferAPI = (orderId, reference) =>
	requestAPI(withQuery(API_ENDPOINTS.payments.bankTransfer(orderId), { reference }), { method: 'POST' });
export const markOrderPaidAPI = (orderId) =>
	requestAPI(API_ENDPOINTS.payments.markPaid(orderId), { method: 'PATCH' });
export const fetchOrderPaymentsAPI = (orderId) => requestAPI(API_ENDPOINTS.payments.byOrder(orderId));
