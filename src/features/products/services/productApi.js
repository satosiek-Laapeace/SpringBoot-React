import { API_ENDPOINTS, withQuery } from '../../../services/apiEndpoints';
import { requestAPI, requestAllPagesAPI } from '../../../services/apiClient';

const toFormData = (values) => {
	if (values instanceof FormData) return values;
	const formData = new FormData();
	Object.entries(values).forEach(([key, value]) => {
		if (value !== undefined && value !== null) formData.append(key, value);
	});
	return formData;
};

export const fetchProductsAPI = (params) => requestAPI(withQuery(API_ENDPOINTS.products.root, params));
export const fetchAllProductsAPI = (params = {}) => requestAllPagesAPI(
  ({ page, size }) => requestAPI(withQuery(API_ENDPOINTS.products.root, { ...params, page, size })),
);
export const fetchMyProductsAPI = () => requestAPI(API_ENDPOINTS.products.mine);
export const fetchProductAPI = (id) => requestAPI(API_ENDPOINTS.products.byId(id));
export const fetchProductsByCategoryAPI = (categoryId, params) =>
	requestAPI(withQuery(API_ENDPOINTS.products.byCategory(categoryId), params));
export const fetchAllProductsByCategoryAPI = (categoryId, params = {}) => requestAllPagesAPI(
	({ page, size }) => requestAPI(withQuery(API_ENDPOINTS.products.byCategory(categoryId), { ...params, page, size })),
);
export const searchProductsAPI = (name) => requestAPI(API_ENDPOINTS.products.byName(name));
export const createProductAPI = (product) => requestAPI(API_ENDPOINTS.products.root, {
	method: 'POST',
	body: toFormData(product),
});
export const updateProductAPI = (id, product) => requestAPI(API_ENDPOINTS.products.byId(id), {
	method: 'PUT',
	body: toFormData(product),
});
export const deleteProductAPI = (id) => requestAPI(API_ENDPOINTS.products.byId(id), { method: 'DELETE' });
export const fetchProductImagesAPI = (productId) => requestAPI(API_ENDPOINTS.products.images(productId));
export const addProductImageAPI = (productId, image) => requestAPI(API_ENDPOINTS.products.images(productId), {
	method: 'POST',
	body: image,
});
export const updateProductImageAPI = (productId, imageId, image) => requestAPI(API_ENDPOINTS.products.image(productId, imageId), {
	method: 'PUT',
	body: image,
});
export const setPrimaryProductImageAPI = (productId, imageId) =>
	requestAPI(API_ENDPOINTS.products.primaryImage(productId, imageId), { method: 'PATCH' });
export const deleteProductImageAPI = (productId, imageId) =>
	requestAPI(API_ENDPOINTS.products.image(productId, imageId), { method: 'DELETE' });

export const fetchCategoriesAPI = (params) => requestAPI(withQuery(API_ENDPOINTS.categories.root, params));
export const fetchCategoryAPI = (id) => requestAPI(API_ENDPOINTS.categories.byId(id));
export const createCategoryAPI = (category) => requestAPI(API_ENDPOINTS.categories.root, {
	method: 'POST',
	body: toFormData(category),
});
export const updateCategoryAPI = (id, category) => requestAPI(API_ENDPOINTS.categories.byId(id), {
	method: 'PUT',
	body: toFormData(category),
});
export const deleteCategoryAPI = (id) => requestAPI(API_ENDPOINTS.categories.byId(id), { method: 'DELETE' });
