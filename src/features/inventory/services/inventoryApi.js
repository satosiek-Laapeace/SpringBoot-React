import { API_ENDPOINTS, withQuery } from '../../../services/apiEndpoints';
import { requestAPI, requestAllPagesAPI } from '../../../services/apiClient';

export const fetchSuppliersAPI = () => requestAPI(API_ENDPOINTS.suppliers.root);
export const fetchSupplierAPI = (id) => requestAPI(API_ENDPOINTS.suppliers.byId(id));
export const createSupplierAPI = (supplier) => requestAPI(API_ENDPOINTS.suppliers.root, {
	method: 'POST',
	body: JSON.stringify(supplier),
});
export const updateSupplierAPI = (id, supplier) => requestAPI(API_ENDPOINTS.suppliers.byId(id), {
	method: 'PUT',
	body: JSON.stringify(supplier),
});
export const activateSupplierAPI = (id) =>
	requestAPI(API_ENDPOINTS.suppliers.activate(id), { method: 'PATCH' });
export const deactivateSupplierAPI = (id) =>
	requestAPI(API_ENDPOINTS.suppliers.deactivate(id), { method: 'PATCH' });

export const fetchStockMovementsAPI = (params) =>
	requestAPI(withQuery(API_ENDPOINTS.stockMovements.root, params));
export const fetchAllStockMovementsAPI = (params = {}) => requestAllPagesAPI(
	({ page, size }) => requestAPI(withQuery(API_ENDPOINTS.stockMovements.root, { ...params, page, size })),
);
export const fetchMyStockMovementsAPI = (params) =>
	requestAPI(withQuery(API_ENDPOINTS.stockMovements.mine, params));
export const fetchAllMyStockMovementsAPI = (params = {}) => requestAllPagesAPI(
	({ page, size }) => requestAPI(withQuery(API_ENDPOINTS.stockMovements.mine, { ...params, page, size })),
);
export const fetchStockMovementAPI = (id) => requestAPI(API_ENDPOINTS.stockMovements.byId(id));
export const fetchProductStockMovementsAPI = (productId) =>
	requestAPI(API_ENDPOINTS.stockMovements.byProduct(productId));
export const fetchSupplierStockMovementsAPI = (supplierId) =>
	requestAPI(API_ENDPOINTS.stockMovements.bySupplier(supplierId));
export const createStockMovementAPI = (movement) => requestAPI(API_ENDPOINTS.stockMovements.root, {
	method: 'POST',
	body: JSON.stringify(movement),
});
