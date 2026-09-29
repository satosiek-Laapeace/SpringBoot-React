// Initial Mock Database Seed based on CraftFarm ERD Schema
export const initialCategories = [
  { id: 1, categories_name: 'Fresh Vegetables', description: 'Farm fresh produce harvested daily', icon_url: '🥗', public_id: 'cat_veg_01', count: 42 },
  { id: 2, categories_name: 'Organic Fruits', description: 'Sweet & seasonal organic fruits', icon_url: '🍎', public_id: 'cat_fruit_02', count: 28 },
  { id: 3, categories_name: 'Seeds & Grains', description: 'High-yield hybrid seeds and premium grains', icon_url: '🌾', public_id: 'cat_seed_03', count: 19 },
  { id: 4, categories_name: 'Fertilizers & Soil Care', description: 'Eco-friendly organic fertilizers and soil enhancers', icon_url: '🪴', public_id: 'cat_fert_04', count: 15 },
  { id: 5, categories_name: 'Farm Tools & Equipment', description: 'Modern agricultural machinery and irrigation tools', icon_url: '🚜', public_id: 'cat_equip_05', count: 12 },
];

export const initialSuppliers = [
  { id: 1, name: 'GreenAgro Supplies Co.', contact_person: 'Sokha Chan', email: 'sokha@greenagro.com', phone: '+855 12 345 678', address: 'Phnom Penh Industrial Zone', description: 'Leading fertilizer and tool distributor', is_active: true },
  { id: 2, name: 'Mekong BioTech Seeds', contact_person: 'Vichheka Nguon', email: 'v.nguon@mekongbio.org', phone: '+855 98 765 432', address: 'Battambang Seed Research Lab', description: 'Specialized in climate-resilient hybrid seeds', is_active: true },
  { id: 3, name: 'AgriTech Irrigation Systems', contact_person: 'Rithy Panh', email: 'rithy@agritech-sys.com', phone: '+855 77 112 233', address: 'Siem Reap Smart Farm Park', description: 'Solar pump and automated drip irrigation maker', is_active: true }
];

export const initialUsers = [
  { id: 1, username: 'farmer_reach', email: 'reach@craftfarm.com', role: 'SELLER', full_name: 'Reach Farmer', avatar: '👨‍🌾', enabled: true, lock_time: null, created_at: '2026-01-15' },
  { id: 2, username: 'buyer_srey', email: 'sreymom@gmail.com', role: 'BUYER', full_name: 'Sreymom Heng', avatar: '👩', enabled: true, lock_time: null, created_at: '2026-02-10' },
  { id: 3, username: 'admin_craft', email: 'admin@craftfarm.io', role: 'ADMIN', full_name: 'Taretan Aditya (Admin)', avatar: '👑', enabled: true, lock_time: null, created_at: '2025-11-01' },
  { id: 4, username: 'farmer_sophea', email: 'sophea@greenfield.com', role: 'SELLER', full_name: 'Sophea Vong', avatar: '🚜', enabled: true, lock_time: null, created_at: '2026-03-01' },
  { id: 5, username: 'buyer_bora', email: 'bora.bun@gmail.com', role: 'BUYER', full_name: 'Bora Bun', avatar: '👨', enabled: false, lock_time: '2026-09-20 14:00', created_at: '2026-03-05' },
];

export const initialAddresses = [
  { id: 101, user_id: 2, street: 'St 271, Sangkat Boeung Tumpun', city: 'Phnom Penh', state: 'Khan Meanchey', zip: '12351', country: 'Cambodia', is_default: true, delivery_instructions: 'Leave package with security gate' },
  { id: 102, user_id: 2, street: 'National Road 5, Village 3', city: 'Battambang', state: 'Battambang Municipality', zip: '02000', country: 'Cambodia', is_default: false, delivery_instructions: 'Call upon arrival' }
];

export const initialProducts = [
  {
    id: 101,
    seller_id: 1,
    category_id: 1,
    category_name: 'Fresh Vegetables',
    name: 'Fresh Harvest Potato',
    description: 'Crisp, organically grown potatoes harvested fresh from high-altitude farm beds. Perfect for roasting, mashing, or soups.',
    price: 8.00,
    discount: '5% Off',
    original_price: 8.50,
    stock_quantity: 450,
    unit: 'kg',
    status: 'Published',
    image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1590165482129-1b8b27698780?auto=format&fit=crop&w=600&q=80'
    ],
    public_id: 'img_pot_01',
    rating: 4.8,
    reviews_count: 120,
    is_organic: true,
    code: '#0012ABMM'
  },
  {
    id: 102,
    seller_id: 1,
    category_id: 1,
    category_name: 'Fresh Vegetables',
    name: 'Vine-Ripened Roma Tomato',
    description: 'Juicy, plump red tomatoes grown under controlled greenhouse sunlight with 0% synthetic pesticides.',
    price: 10.00,
    discount: 'No Discount',
    original_price: 10.00,
    stock_quantity: 320,
    unit: 'kg',
    status: 'Published',
    image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'
    ],
    public_id: 'img_tom_02',
    rating: 4.9,
    reviews_count: 98,
    is_organic: true,
    code: '#0012ABMN'
  },
  {
    id: 103,
    seller_id: 1,
    category_id: 1,
    category_name: 'Fresh Vegetables',
    name: 'Sweet Crunchy Carrot',
    description: 'Vibrant orange carrots rich in Beta-Carotene. Hand-picked daily from dark mineral soils.',
    price: 6.50,
    discount: '10% Off',
    original_price: 7.20,
    stock_quantity: 45,
    unit: 'kg',
    status: 'Published',
    image_url: 'https://images.unsplash.com/photo-1598170845058-12ef4a457939?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1598170845058-12ef4a457939?auto=format&fit=crop&w=600&q=80'
    ],
    public_id: 'img_car_03',
    rating: 4.7,
    reviews_count: 85,
    is_organic: true,
    code: '#0012ABMO'
  },
  {
    id: 104,
    seller_id: 1,
    category_id: 1,
    category_name: 'Fresh Vegetables',
    name: 'Snowball White Cauliflower',
    description: 'Tender heads of snow-white cauliflower, dense florets perfect for farm-fresh salads and curries.',
    price: 12.00,
    discount: 'No Discount',
    original_price: 12.00,
    stock_quantity: 90,
    unit: 'piece',
    status: 'Published',
    image_url: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80'
    ],
    public_id: 'img_caul_04',
    rating: 4.8,
    reviews_count: 64,
    is_organic: true,
    code: '#0012ABMP'
  },
  {
    id: 105,
    seller_id: 1,
    category_id: 2,
    category_name: 'Organic Fruits',
    name: 'Golden Sweet Mango',
    description: 'Export-quality golden mangoes with rich aroma, smooth texture, and non-fibrous sweet pulp.',
    price: 15.00,
    discount: '15% Off',
    original_price: 17.60,
    stock_quantity: 210,
    unit: 'kg',
    status: 'Published',
    image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80'
    ],
    public_id: 'img_man_05',
    rating: 5.0,
    reviews_count: 210,
    is_organic: true,
    code: '#0012ABMQ'
  },
  {
    id: 106,
    seller_id: 1,
    category_id: 1,
    category_name: 'Fresh Vegetables',
    name: 'Fresh Green Broccoli',
    description: 'Nutrient-rich broccoli crowns packed with vitamins and crisp texture, grown with organic compost.',
    price: 9.50,
    discount: 'No Discount',
    original_price: 9.50,
    stock_quantity: 140,
    unit: 'kg',
    status: 'Published',
    image_url: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80'
    ],
    public_id: 'img_broc_06',
    rating: 4.6,
    reviews_count: 52,
    is_organic: true,
    code: '#0012ABMR'
  },
  {
    id: 107,
    seller_id: 1,
    category_id: 1,
    category_name: 'Fresh Vegetables',
    name: 'Crisp Garden Cucumber',
    description: 'Refreshing high-hydration cucumbers harvested at peak crispness.',
    price: 4.00,
    discount: '5% Off',
    original_price: 4.20,
    stock_quantity: 500,
    unit: 'kg',
    status: 'Published',
    image_url: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=600&q=80'
    ],
    public_id: 'img_cuc_07',
    rating: 4.8,
    reviews_count: 77,
    is_organic: true,
    code: '#0012ABMS'
  },
  {
    id: 108,
    seller_id: 1,
    category_id: 5,
    category_name: 'Farm Tools & Equipment',
    name: 'Smart Drip Irrigation Kit',
    description: 'Automated solar-powered drip irrigation system with Bluetooth pressure sensors and moisture probe.',
    price: 149.00,
    discount: '$20 Off',
    original_price: 169.00,
    stock_quantity: 35,
    unit: 'set',
    status: 'Published',
    image_url: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80'
    ],
    public_id: 'img_eq_08',
    rating: 4.9,
    reviews_count: 38,
    is_organic: false,
    code: '#0012ABMT'
  }
];

export const initialOrders = [
  {
    id: 5001,
    buyer_id: 2,
    buyer_name: 'Sreymom Heng',
    address_id: 101,
    delivery_time: '2026-09-30 08:30:00',
    delivery_slot: 'Morning (8:00 AM - 11:00 AM)',
    total_amount: 32.50,
    status: 'PENDING',
    created_at: '2026-09-28T10:15:00Z',
    items: [
      { id: 1, product_id: 101, name: 'Fresh Harvest Potato', quantity: 2, price_at_purchase: 8.00, sub_total: 16.00 },
      { id: 2, product_id: 103, name: 'Sweet Crunchy Carrot', quantity: 1, price_at_purchase: 6.50, sub_total: 6.50 },
      { id: 3, product_id: 102, name: 'Vine-Ripened Roma Tomato', quantity: 1, price_at_purchase: 10.00, sub_total: 10.00 }
    ],
    payment: {
      id: 901,
      method: 'ABA KHQR',
      status: 'PAID',
      transaction_id: 'TXN-ABA-982143',
      paid_at: '2026-09-28T10:16:20Z'
    }
  },
  {
    id: 5002,
    buyer_id: 2,
    buyer_name: 'Phnom Penh Fresh Market',
    address_id: 102,
    delivery_time: '2026-10-01 14:00:00',
    delivery_slot: 'Afternoon (1:00 PM - 4:00 PM)',
    total_amount: 164.00,
    status: 'PROCESSING',
    created_at: '2026-09-29T08:00:00Z',
    items: [
      { id: 4, product_id: 105, name: 'Golden Sweet Mango', quantity: 10, price_at_purchase: 15.00, sub_total: 150.00 },
      { id: 5, product_id: 107, name: 'Crisp Garden Cucumber', quantity: 3.5, price_at_purchase: 4.00, sub_total: 14.00 }
    ],
    payment: {
      id: 902,
      method: 'Credit Card',
      status: 'PAID',
      transaction_id: 'TXN-VISA-33211',
      paid_at: '2026-09-29T08:01:10Z'
    }
  },
  {
    id: 5003,
    buyer_id: 5,
    buyer_name: 'Bora Bun',
    address_id: 101,
    delivery_time: '2026-09-29 17:00:00',
    delivery_slot: 'Evening (5:00 PM - 8:00 PM)',
    total_amount: 45.00,
    status: 'SHIPPED',
    created_at: '2026-09-29T11:20:00Z',
    items: [
      { id: 6, product_id: 104, name: 'Snowball White Cauliflower', quantity: 3, price_at_purchase: 12.00, sub_total: 36.00 }
    ],
    payment: {
      id: 903,
      method: 'COD',
      status: 'PENDING',
      transaction_id: 'TXN-COD-5512',
      paid_at: null
    }
  }
];

export const initialStockMovements = [
  { id: 1, product_id: 101, product_name: 'Fresh Harvest Potato', type: 'RESTOCK_IN', quantity_change: 200, quantity_after: 450, supplier_id: 1, supplier_name: 'GreenAgro Supplies Co.', reference_order_id: null, note: 'Harvest batch #440 received', created_at: '2026-09-27T09:00:00Z' },
  { id: 2, product_id: 102, product_name: 'Vine-Ripened Roma Tomato', type: 'SALE_OUT', quantity_change: -30, quantity_after: 320, supplier_id: null, supplier_name: '-', reference_order_id: 5001, note: 'Order #5001 fulfilled', created_at: '2026-09-28T10:20:00Z' },
  { id: 3, product_id: 108, product_name: 'Smart Drip Irrigation Kit', type: 'ADJUSTMENT', quantity_change: +5, quantity_after: 35, supplier_id: 3, supplier_name: 'AgriTech Irrigation Systems', reference_order_id: null, note: 'Inventory count reconciliation', created_at: '2026-09-29T07:30:00Z' }
];

export const initialReviews = [
  { id: 1, product_id: 101, buyer_id: 2, buyer_name: 'Sreymom Heng', rating: 5, comment: 'Exceptional quality potatoes! Super clean and firm, made amazing baked potato soup.', created_at: '2026-09-25T14:20:00Z' },
  { id: 2, product_id: 105, buyer_id: 2, buyer_name: 'Rithy Sok', rating: 5, comment: 'Sweetest mangoes in town. Delivered fresh within 3 hours in Phnom Penh.', created_at: '2026-09-26T11:05:00Z' }
];

export const initialNotifications = [
  { id: 1, user_id: 2, type: 'ORDER_STATUS', title: 'Order #5001 Dispatched', message: 'Your fresh produce package is on its way with live temperature control.', is_read: false, created_at: '10 mins ago' },
  { id: 2, user_id: 2, type: 'PROMOTION', title: 'Harvest Season Discount!', message: 'Get 15% OFF Golden Sweet Mangoes this week only.', is_read: false, created_at: '2 hours ago' },
  { id: 3, user_id: 2, type: 'SYSTEM', title: 'Smart Irrigation Sync Alert', message: 'Soil Moisture in Field B restored to optimal 65%.', is_read: true, created_at: '1 day ago' }
];

export const initialFleetVehicles = [
  { id: 'V-101', name: 'Cooling Truck Alpha (Tractor)', driver: 'Sophea Vong', status: 'Active', location: '02 Green street, Rajshahi', range: '28 KM', health: '98%' },
  { id: 'V-102', name: 'Produce Delivery Van Beta', driver: 'Bora Bun', status: 'Active', location: 'National Highway 4', range: '14 KM', health: '94%' },
  { id: 'V-103', name: 'Smart Harvester Delta', driver: 'In Maintenance', status: 'In-Active', location: 'Central Workshop', range: '0 KM', health: '65%' }
];
