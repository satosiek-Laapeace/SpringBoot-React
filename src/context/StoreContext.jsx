import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { fetchAllAPI } from '../services/apiDataService';
import { cancelOrderAPI, updateOrderStatusAPI } from '../features/orders/services/orderApi';
import { createStockMovementAPI } from '../features/inventory/services/inventoryApi';
import { createProductAPI, deleteProductAPI } from '../features/products/services/productApi';
import { addCartItemAPI, clearCartAPI, removeCartItemAPI, updateCartItemAPI } from '../features/cart/services/cartApi';
import { normalizeProduct } from '../features/products/utils/normalizeProduct';
import { markAllNotificationsReadAPI, markNotificationReadAPI, fetchNotificationsAPI } from '../features/notifications/services/notificationApi';
import { useAuth } from '../features/auth/hooks/useAuth';
import {
  initialProducts,
  initialCategories,
  initialSuppliers,
  initialUsers,
  initialAddresses,
  initialOrders,
  initialStockMovements,
  initialReviews,
  initialNotifications,
  initialFleetVehicles
} from '../utils/mockData';

const StoreContext = createContext();
const EMPTY_CART = [];
const normalizeCartQuantity = (value) => {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
};
const normalizeNotification = (notification) => ({
  ...notification,
  is_read: Boolean(notification.read ?? notification.isRead ?? notification.is_read),
  created_at: notification.createdAt ?? notification.created_at,
});

export const StoreProvider = ({ children }) => {
  const { user: currentUser, role, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const activeRole = role || 'GUEST';

  const [users] = useState(initialUsers);
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [addresses, setAddresses] = useState(initialAddresses);
  const [orders, setOrders] = useState(initialOrders);
  const [stockMovements, setStockMovements] = useState(initialStockMovements);
  const [reviews, setReviews] = useState(initialReviews);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [vehicles] = useState(initialFleetVehicles);

  const [cartState, setCartState] = useState({ token: null, items: [] });
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const isBuyer = activeRole === 'BUYER' && Boolean(token);
  const cart = isBuyer && cartState.token === token ? cartState.items : EMPTY_CART;
  const isCartOpen = isBuyer && cartDrawerOpen;
  const setCart = useCallback((nextItems) => setCartState((current) => {
    const currentItems = current.token === token ? current.items : [];
    return {
      token,
      items: typeof nextItems === 'function' ? nextItems(currentItems) : nextItems,
    };
  }), [token]);
  const setIsCartOpen = (nextOpen) => {
    const shouldOpen = typeof nextOpen === 'function' ? nextOpen(isCartOpen) : nextOpen;
    setCartDrawerOpen(Boolean(shouldOpen) && isBuyer);
  };

  useEffect(() => {
    if (!isBuyer && cartState.token) {
      setCartState({ token: null, items: [] });
      localStorage.removeItem('craftfarm_cart');
    }
  }, [isBuyer, cartState.token]);

  useEffect(() => {
    if (authLoading) return;
    let isCurrent = true;

    const loadAPIData = async () => {
      const apiData = await fetchAllAPI({
        user: currentUser,
        role: activeRole,
        isAuthenticated,
      });
      if (!isCurrent) return;

      if (Array.isArray(apiData.products)) {
        setProducts(apiData.products.map(normalizeProduct));
      } else if (activeRole === 'SELLER') {
        setProducts([]);
      }

      if (Array.isArray(apiData.categories)) {
        setCategories(apiData.categories.map((category) => ({
          ...category,
          id: category.id ?? category.categoryId,
          categories_name: category.name ?? category.categoryName ?? 'Other',
          description: category.description ?? 'Farm produce category',
          icon_url: category.iconUrl ?? category.icon_url ?? '🌱',
        })));
      }

      if (Array.isArray(apiData.orders)) setOrders(apiData.orders);
      else if (activeRole === 'SELLER') setOrders([]);
      if (Array.isArray(apiData.reviews)) setReviews(apiData.reviews);
      if (Array.isArray(apiData.notifications)) setNotifications(apiData.notifications.map(normalizeNotification));
      else if (isAuthenticated) setNotifications([]);

      if (Array.isArray(apiData.cart?.cartItems)) {
        setCart(apiData.cart.cartItems.map((item) => ({
          product_id: item.productId,
          quantity: normalizeCartQuantity(item.quantity),
        })));
      }

      if (Array.isArray(apiData.suppliers)) {
        setSuppliers(apiData.suppliers.map((supplier) => ({
          ...supplier,
          id: supplier.id ?? supplier.supplierId,
          name: supplier.name ?? supplier.supplierName ?? 'Supplier',
          contact_person: supplier.contactPerson ?? supplier.contact_person ?? supplier.contact ?? '',
          phone: supplier.phone ?? '',
          is_active: supplier.active ?? supplier.is_active ?? true,
        })));
      }

      if (Array.isArray(apiData.addresses)) {
        setAddresses(apiData.addresses.map((address) => ({
          ...address,
          id: address.id ?? address.addressId,
          title: address.title ?? 'Address',
          street_address: address.streetAddress ?? address.street_address ?? address.street ?? '',
          postal_code: address.postalCode ?? address.postal_code ?? address.zipCode ?? address.zip ?? '',
          is_default: address.isDefault ?? address.is_default ?? false,
        })));
      }

      if (Array.isArray(apiData.stockMovements)) {
        setStockMovements(apiData.stockMovements.map(movement => ({
          ...movement,
          product_id: movement.productId ?? movement.product_id,
          product_name: movement.productName ?? movement.product_name ?? '',
          quantity_change: Number(movement.quantityChange ?? movement.quantity_change ?? 0),
          quantity_after: Number(movement.quantityAfter ?? movement.quantity_after ?? 0),
          created_at: movement.createdAt ?? movement.created_at,
        })));
      }
    };

    loadAPIData();
    return () => {
      isCurrent = false;
    };
  }, [authLoading, activeRole, currentUser, isAuthenticated, setCart, token]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !currentUser?.id) return undefined;
    let isCurrent = true;
    const refreshNotifications = async () => {
      try {
        const result = await fetchNotificationsAPI({ userId: currentUser.id, page: 0, size: 50 });
        if (isCurrent && Array.isArray(result)) setNotifications(result.map(normalizeNotification));
      } catch (error) {
        if (error.status !== 401 && error.status !== 403) {
          console.warn(`FarmCraft notifications API: ${error.message}`);
        }
      }
    };
    const intervalId = window.setInterval(refreshNotifications, 30000);
    return () => {
      isCurrent = false;
      window.clearInterval(intervalId);
    };
  }, [authLoading, isAuthenticated, currentUser?.id]);

  const markNotificationAsRead = async (notificationId) => {
    if (!currentUser?.id) return;
    const notification = notifications.find(item => String(item.id) === String(notificationId));
    if (notification?.is_read) return;
    await markNotificationReadAPI(notificationId, currentUser.id);
    setNotifications(current => current.map(item => String(item.id) === String(notificationId)
      ? { ...item, read: true, is_read: true }
      : item));
  };

  const markAllNotificationsAsRead = async () => {
    if (!currentUser?.id) return;
    await markAllNotificationsReadAPI(currentUser.id);
    setNotifications(current => current.map(item => ({ ...item, read: true, is_read: true })));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isBuyer) {
      setCartState((current) => ({ token: null, items: [] }));
      localStorage.removeItem('craftfarm_cart');
      return;
    }
    localStorage.setItem('craftfarm_cart', JSON.stringify(cart));
  }, [authLoading, cart, isBuyer]);

  // Cart Actions
  const addToCart = (product, qty = 1) => {
    if (activeRole !== 'BUYER' || !token) return false;
    const quantityToAdd = normalizeCartQuantity(qty);

    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: normalizeCartQuantity(item.quantity) + quantityToAdd }
            : item
        );
      }
      return [...prev, { product_id: product.id, quantity: quantityToAdd }];
    });
    addCartItemAPI(product.id, quantityToAdd).catch((error) => console.warn(`FarmCraft cart API: ${error.message}`));
    setIsCartOpen(true);
    return true;
  };

  const updateCartQuantity = (productId, quantity) => {
    if (activeRole !== 'BUYER' || !token) return;
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
    updateCartItemAPI(productId, quantity).catch((error) => console.warn(`FarmCraft cart API: ${error.message}`));
  };

  const removeFromCart = (productId) => {
    if (activeRole !== 'BUYER' || !token) return;
    setCart(prev => prev.filter(item => item.product_id !== productId));
    removeCartItemAPI(productId).catch((error) => console.warn(`FarmCraft cart API: ${error.message}`));
  };

  const clearCart = () => {
    if (activeRole !== 'BUYER' || !token) return;
    setCart([]);
    clearCartAPI().catch((error) => console.warn(`FarmCraft cart API: ${error.message}`));
  };

  const updateOrderStatus = async (orderId, status) => {
    if (localStorage.getItem('token')) {
      try {
        if (status === 'CANCELLED') {
          await cancelOrderAPI(orderId);
          setOrders(currentOrders => currentOrders.map(order =>
            order.id === orderId ? { ...order, status } : order
          ));
          return true;
        }

        const updatedOrder = await updateOrderStatusAPI(orderId, status);
        setOrders(currentOrders => currentOrders.map(order =>
          order.id === orderId ? { ...order, ...updatedOrder } : order
        ));
        return true;
      } catch {
        return false;
      }
    }

    setOrders(currentOrders => currentOrders.map(order =>
      order.id === orderId ? { ...order, status } : order
    ));
    return true;
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.product_id);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const addProduct = async (newProduct) => {
    const created = normalizeProduct(await createProductAPI(newProduct));
    setProducts(prev => [created, ...prev.filter(product => product.id !== created.id)]);
    return created;
  };

  const updateProduct = (productId, updates) => {
    setProducts(prev => prev.map((product) => {
      if (product.id !== productId) return product;

      return {
        ...product,
        ...updates,
        price: Number(updates.price ?? product.price),
        stock_quantity: Number(updates.stock_quantity ?? product.stock_quantity),
        image_url: updates.image_url || updates.images?.[0] || product.image_url,
        images: Array.isArray(updates.images) && updates.images.length > 0 ? updates.images : product.images || [product.image_url],
      };
    }));
  };

  const deleteProduct = async (productId) => {
    await deleteProductAPI(productId);
    setProducts(prev => prev.filter((product) => product.id !== productId));
  };

  const addStockMovement = async (movement) => {
    const saved = await createStockMovementAPI({
      productId: movement.product_id,
      type: movement.type,
      quantityChange: Number(movement.quantity_change),
      supplierId: movement.supplier_id || null,
      note: movement.note,
    });
    const product = products.find(item => String(item.id) === String(saved.productId));
    const savedMovement = {
      ...saved,
      product_id: saved.productId,
      product_name: product?.name || movement.product_name,
      quantity_change: Number(saved.quantityChange),
      quantity_after: Number(saved.quantityAfter),
      created_at: saved.createdAt,
    };
    setStockMovements(prev => [savedMovement, ...prev.filter(item => item.id !== saved.id)]);

    setProducts(prev => prev.map((product) => {
      if (String(product.id) !== String(saved.productId)) return product;
      return { ...product, stock_quantity: Number(saved.quantityAfter) };
    }));
    return savedMovement;
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        activeRole,
        users,
        products,
        categories,
        suppliers,
        addresses,
        orders,
        stockMovements,
        reviews,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        vehicles,
        cart,
        addProduct,
        updateProduct,
        deleteProduct,
        addStockMovement,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        updateOrderStatus,
        getCartTotal,
        getCartCount,
        isCartOpen,
        setIsCartOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
