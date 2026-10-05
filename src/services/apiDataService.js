import { fetchCartAPI } from '../features/cart/services/cartApi';
import { fetchAllProductsAPI, fetchCategoriesAPI, fetchMyProductsAPI } from '../features/products/services/productApi';
import { fetchMyOrdersAPI, fetchMySellerOrdersAPI, fetchOrdersAPI } from '../features/orders/services/orderApi';
import { fetchSuppliersAPI, fetchAllMyStockMovementsAPI, fetchAllStockMovementsAPI } from '../features/inventory/services/inventoryApi';
import { fetchMyReviewsAPI } from '../features/reviews/services/reviewApi';
import { fetchNotificationsAPI } from '../features/notifications/services/notificationApi';
import { fetchAddressesAPI } from '../features/user-profile/services/profileApi';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('farmcraft_user') || 'null');
  } catch {
    return null;
  }
};

const fetchSafely = async (feature, request) => {
  try {
    return await request();
  } catch (error) {
    if (error.status !== 401) {
      console.warn(`FarmCraft ${feature} API: ${error.message}`);
    }
    return null;
  }
};

export const fetchAllAPI = async ({ user: overrideUser, role: overrideRole, isAuthenticated = Boolean(localStorage.getItem('token')) } = {}) => {
  const user = overrideUser || getStoredUser();
  const role = overrideRole || user?.role || user?.roles?.[0] || null;
  const hasValidAuthSession = isAuthenticated && Boolean(localStorage.getItem('token'));

  const [products, categories, orders, suppliers, addresses, cart, stockMovements, reviews, notifications] = await Promise.all([
    hasValidAuthSession && role === 'SELLER'
      ? fetchSafely('seller products', fetchMyProductsAPI)
      : fetchSafely('products', fetchAllProductsAPI),
    fetchSafely('categories', fetchCategoriesAPI),
    hasValidAuthSession && role === 'BUYER'
      ? fetchSafely('orders', fetchMyOrdersAPI)
      : hasValidAuthSession && role === 'ADMIN'
        ? fetchSafely('orders', fetchOrdersAPI)
        : hasValidAuthSession && role === 'SELLER'
          ? fetchSafely('seller orders', fetchMySellerOrdersAPI)
          : Promise.resolve(null),
    hasValidAuthSession && role === 'ADMIN' ? fetchSafely('suppliers', fetchSuppliersAPI) : Promise.resolve(null),
    hasValidAuthSession && ['BUYER', 'ADMIN'].includes(role) ? fetchSafely('addresses', fetchAddressesAPI) : Promise.resolve(null),
    hasValidAuthSession && role === 'BUYER' ? fetchSafely('cart', fetchCartAPI) : Promise.resolve(null),
    hasValidAuthSession && role === 'SELLER'
      ? fetchSafely('seller stock movements', fetchAllMyStockMovementsAPI)
      : hasValidAuthSession && role === 'ADMIN'
        ? fetchSafely('stock movements', fetchAllStockMovementsAPI)
        : Promise.resolve(null),
    hasValidAuthSession && role === 'BUYER' ? fetchSafely('reviews', () => fetchMyReviewsAPI({ page: 0, size: 50 })) : Promise.resolve(null),
    hasValidAuthSession && user?.id
      ? fetchSafely('notifications', () => fetchNotificationsAPI({ userId: user.id, page: 0, size: 50 }))
      : Promise.resolve(null),
  ]);

  return { products, categories, orders, suppliers, addresses, cart, stockMovements, reviews, notifications };
};
