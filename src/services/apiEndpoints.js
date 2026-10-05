export const API_ENDPOINTS = {
	auth: {
		login: '/api/auth/login',
		register: '/api/auth/register',
		logout: '/api/auth/logout',
		forgotPassword: '/api/auth/forgot-password',
		resetPassword: '/api/auth/reset-password',
		googleLogin: '/api/auth/google/login',
		googleRegister: '/api/auth/google/register',
	},
	users: {
		root: '/api/users',
		me: '/api/users/me',
		byId: (id) => `/api/users/${encodeURIComponent(id)}`,
		profile: (id) => `/api/users/${encodeURIComponent(id)}/profile`,
		profilePicture: (id) => `/api/users/${encodeURIComponent(id)}/profile-picture`,
		role: (id) => `/api/users/${encodeURIComponent(id)}/role`,
		enabled: (id) => `/api/users/${encodeURIComponent(id)}/enabled`,
		unlock: (id) => `/api/users/${encodeURIComponent(id)}/unlock`,
	},
	securityLogs: {
		root: '/api/admin/security-logs',
	},
	products: {
		root: '/api/products',
		mine: '/api/products/mine',
		byId: (id) => `/api/products/${encodeURIComponent(id)}`,
		byCategory: (categoryId) => `/api/products/category/${encodeURIComponent(categoryId)}`,
		byName: (name) => `/api/products/name/${encodeURIComponent(name)}`,
		images: (productId) => `/api/products/${encodeURIComponent(productId)}/images`,
		image: (productId, imageId) => `/api/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`,
		primaryImage: (productId, imageId) => `/api/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}/primary`,
	},
	categories: {
		root: '/api/categories',
		byId: (id) => `/api/categories/${encodeURIComponent(id)}`,
	},
	orders: {
		root: '/api/orders',
		mine: '/api/orders/my',
		sellerMine: '/api/orders/seller/my',
		byBuyer: (buyerId) => `/api/orders/buyer/${encodeURIComponent(buyerId)}`,
		byId: (id) => `/api/orders/${encodeURIComponent(id)}`,
		status: (id) => `/api/orders/${encodeURIComponent(id)}/status`,
	},
	cart: {
		root: '/api/cart',
		items: '/api/cart/items',
		item: (productId) => `/api/cart/items/${encodeURIComponent(productId)}`,
	},
	payments: {
		checkout: (orderId) => `/api/payments/checkout/${encodeURIComponent(orderId)}`,
		khqr: (orderId) => `/api/payments/khqr/${encodeURIComponent(orderId)}`,
		verifyKhqr: (orderId) => `/api/payments/khqr/${encodeURIComponent(orderId)}/verify`,
		cod: (orderId) => `/api/payments/cod/${encodeURIComponent(orderId)}`,
		bankTransfer: (orderId) => `/api/payments/bank-transfer/${encodeURIComponent(orderId)}`,
		markPaid: (orderId) => `/api/payments/order/${encodeURIComponent(orderId)}/paid`,
		byOrder: (orderId) => `/api/payments/order/${encodeURIComponent(orderId)}`,
	},
	suppliers: {
		root: '/api/suppliers',
		byId: (id) => `/api/suppliers/${encodeURIComponent(id)}`,
		activate: (id) => `/api/suppliers/${encodeURIComponent(id)}/activate`,
		deactivate: (id) => `/api/suppliers/${encodeURIComponent(id)}/deactivate`,
	},
	stockMovements: {
		root: '/api/stock-movements',
		mine: '/api/stock-movements/mine',
		byId: (id) => `/api/stock-movements/${encodeURIComponent(id)}`,
		byProduct: (productId) => `/api/stock-movements/product/${encodeURIComponent(productId)}`,
		bySupplier: (supplierId) => `/api/stock-movements/supplier/${encodeURIComponent(supplierId)}`,
	},
	reviews: {
		root: '/api/reviews',
		mine: '/api/reviews/me',
		byId: (id) => `/api/reviews/${encodeURIComponent(id)}`,
		byProduct: (productId) => `/api/reviews/product/${encodeURIComponent(productId)}`,
		productSummary: (productId) => `/api/reviews/product/${encodeURIComponent(productId)}/summary`,
	},
	notifications: {
		root: '/api/notifications',
		unreadCount: '/api/notifications/unread-count',
		readAll: '/api/notifications/read-all',
		markRead: (id) => `/api/notifications/${encodeURIComponent(id)}/read`,
		byId: (id) => `/api/notifications/${encodeURIComponent(id)}`,
	},
	addresses: {
		root: '/api/addresses',
		byId: (id) => `/api/addresses/${encodeURIComponent(id)}`,
		nearby: '/api/addresses/nearby',
		setDefault: (id) => `/api/addresses/${encodeURIComponent(id)}/default`,
	},
	platformSettings: {
		marketplace: '/api/settings/marketplace',
	},
};

export const withQuery = (endpoint, params = {}) => {
	const query = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== '') query.set(key, value);
	});
	const serialized = query.toString();
	return serialized ? `${endpoint}?${serialized}` : endpoint;
};
