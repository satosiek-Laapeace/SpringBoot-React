import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const StoreProvider = ({ children }) => {
  // Current user & active role (BUYER | SELLER | ADMIN)
  const [currentUser, setCurrentUser] = useState(initialUsers[1]); // Default BUYER (Sreymom Heng)
  const [activeRole, setActiveRole] = useState('BUYER');

  // ERD State
  const [users, setUsers] = useState(initialUsers);
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('craftfarm_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });
  const [categories, setCategories] = useState(initialCategories);
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [addresses, setAddresses] = useState(initialAddresses);
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('craftfarm_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });
  const [stockMovements, setStockMovements] = useState(initialStockMovements);
  const [reviews, setReviews] = useState(initialReviews);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [vehicles, setVehicles] = useState(initialFleetVehicles);

  // Cart State
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('craftfarm_cart');
    return saved ? JSON.parse(saved) : [
      { product_id: 101, quantity: 2 },
      { product_id: 103, quantity: 1 }
    ];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('craftfarm_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('craftfarm_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('craftfarm_orders', JSON.stringify(orders));
  }, [orders]);

  // User Governance Actions (user_tbl, roles, user_roles)
  const toggleUserEnabled = (userId) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, enabled: !u.enabled } : u))
    );
  };

  const toggleUserLock = (userId) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const isLocked = !!u.lock_time;
          return {
            ...u,
            lock_time: isLocked ? null : new Date().toISOString().slice(0, 16).replace('T', ' ')
          };
        }
        return u;
      })
    );
  };

  const updateUserRole = (userId, newRole) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  // Category Actions (category_tbl)
  const addCategory = (category) => {
    const newCat = {
      id: Date.now(),
      public_id: `cat_${Date.now()}`,
      count: 0,
      ...category
    };
    setCategories(prev => [...prev, newCat]);
  };

  const deleteCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Cart Actions
  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product_id: product.id, quantity: qty }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.product_id);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Product Actions
  const addProduct = (newProduct) => {
    const product = {
      id: Date.now(),
      seller_id: currentUser.id,
      rating: 5.0,
      reviews_count: 0,
      status: 'Published',
      public_id: `img_${Date.now()}`,
      code: `#00${Math.floor(1000 + Math.random() * 9000)}ABM`,
      images: [newProduct.image_url],
      ...newProduct
    };
    setProducts(prev => [product, ...prev]);

    addStockMovement({
      product_id: product.id,
      product_name: product.name,
      type: 'INITIAL_STOCK',
      quantity_change: product.stock_quantity,
      quantity_after: product.stock_quantity,
      supplier_id: null,
      supplier_name: 'Self Farm Harvest',
      note: 'Initial inventory listing'
    });
  };

  const updateProduct = (updatedProduct) => {
    setProducts(prev =>
      prev.map(p => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
    );
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Stock Movement Actions
  const addStockMovement = (movement) => {
    const newMovement = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      ...movement
    };
    setStockMovements(prev => [newMovement, ...prev]);

    if (movement.product_id && movement.quantity_change) {
      setProducts(prev =>
        prev.map(p => {
          if (p.id === movement.product_id) {
            const newStock = Math.max(0, p.stock_quantity + movement.quantity_change);
            return { ...p, stock_quantity: newStock };
          }
          return p;
        })
      );
    }
  };

  // Order Actions
  const createOrder = (orderData) => {
    const cartItemsDetails = cart.map(item => {
      const p = products.find(prod => prod.id === item.product_id);
      return {
        id: Date.now() + Math.floor(Math.random() * 100),
        product_id: item.product_id,
        name: p ? p.name : 'Farm Product',
        quantity: item.quantity,
        price_at_purchase: p ? p.price : 0,
        sub_total: p ? p.price * item.quantity : 0
      };
    });

    const totalAmount = getCartTotal();

    const newOrder = {
      id: Math.floor(5000 + Math.random() * 5000),
      buyer_id: currentUser.id,
      buyer_name: currentUser.full_name,
      address_id: orderData.address_id || 101,
      delivery_time: orderData.delivery_time || '2026-09-30 10:00:00',
      delivery_slot: orderData.delivery_slot || 'Morning (8:00 AM - 11:00 AM)',
      total_amount: totalAmount,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      items: cartItemsDetails,
      payment: {
        id: Date.now(),
        method: orderData.payment_method || 'ABA KHQR',
        status: 'PAID',
        transaction_id: `TXN-ABA-${Math.floor(100000 + Math.random() * 900000)}`,
        paid_at: new Date().toISOString()
      }
    };

    setOrders(prev => [newOrder, ...prev]);

    cartItemsDetails.forEach(item => {
      addStockMovement({
        product_id: item.product_id,
        product_name: item.name,
        type: 'SALE_OUT',
        quantity_change: -item.quantity,
        quantity_after: Math.max(0, (products.find(p => p.id === item.product_id)?.stock_quantity || 0) - item.quantity),
        supplier_id: null,
        supplier_name: '-',
        reference_order_id: newOrder.id,
        note: `Order #${newOrder.id} checkout`
      });
    });

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Supplier Actions
  const addSupplier = (supplier) => {
    const newSupp = { id: Date.now(), is_active: true, created_at: new Date().toISOString(), ...supplier };
    setSuppliers(prev => [...prev, newSupp]);
  };

  // Review Actions
  const addReview = (product_id, rating, comment) => {
    const newRev = {
      id: Date.now(),
      product_id,
      buyer_id: currentUser.id,
      buyer_name: currentUser.full_name,
      rating,
      comment,
      created_at: new Date().toISOString()
    };
    setReviews(prev => [newRev, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const switchRole = (role) => {
    setActiveRole(role);
    if (role === 'BUYER') setCurrentUser(initialUsers[1]);
    if (role === 'SELLER') setCurrentUser(initialUsers[0]);
    if (role === 'ADMIN') setCurrentUser(initialUsers[2]);
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        activeRole,
        switchRole,
        users,
        toggleUserEnabled,
        toggleUserLock,
        updateUserRole,
        products,
        categories,
        addCategory,
        deleteCategory,
        suppliers,
        addresses,
        orders,
        stockMovements,
        reviews,
        notifications,
        vehicles,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount,
        isCartOpen,
        setIsCartOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        addProduct,
        updateProduct,
        deleteProduct,
        addStockMovement,
        createOrder,
        updateOrderStatus,
        addSupplier,
        addReview,
        markNotificationAsRead,
        markAllNotificationsAsRead
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
