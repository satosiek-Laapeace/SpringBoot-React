import { fetchProductsAPI } from '../features/products/services/productApi';
import { fetchNotificationsAPI } from '../features/notifications/services/notificationApi';

const DEMO_DASHBOARD = {
  analytics: {
    totalYield: '18.4 t',
    yieldChange: '+8.2%',
    activeCrops: 12,
    revenue: 24860,
    revenueChange: '+12.6%',
    sensorHealth: 96,
    trends: {
      Daily: [34, 48, 41, 62, 52, 74, 60],
      Weekly: [40, 57, 48, 78, 64, 88, 70],
      Monthly: [36, 52, 45, 68, 82, 72, 94],
    },
    categoryBreakdown: [
      { name: 'Vegetables', share: 52 },
      { name: 'Fruits', share: 28 },
      { name: 'Grains & herbs', share: 20 },
    ],
  },
  crops: [
    { id: 'crop-1', name: 'Roma tomatoes', variety: 'Solanum lycopersicum', field: 'North greenhouse', stage: 'Fruiting', progress: 78, area: '1.8 ha', status: 'Healthy' },
    { id: 'crop-2', name: 'Sweet corn', variety: 'Golden Bantam', field: 'East field', stage: 'Growing', progress: 56, area: '3.2 ha', status: 'Healthy' },
    { id: 'crop-3', name: 'Baby spinach', variety: 'Savoy', field: 'River beds', stage: 'Ready to harvest', progress: 92, area: '0.9 ha', status: 'Harvest soon' },
    { id: 'crop-4', name: 'Bell peppers', variety: 'California Wonder', field: 'South greenhouse', stage: 'Flowering', progress: 42, area: '1.1 ha', status: 'Healthy' },
  ],
  orders: [
    { id: 'FC-2841', customer: 'Green Basket Co-op', item: 'Roma tomatoes', quantity: '48 kg', total: 312, status: 'Pending' },
    { id: 'FC-2839', customer: 'Harvest Table', item: 'Baby spinach', quantity: '24 kg', total: 168, status: 'Shipped' },
    { id: 'FC-2837', customer: 'Oak & Vine Market', item: 'Sweet corn', quantity: '60 kg', total: 240, status: 'Harvested' },
  ],
  sensors: [
    { id: 'sensor-1', field: 'North greenhouse', metric: 'Soil moisture', value: '68%', state: 'Optimal' },
    { id: 'sensor-2', field: 'East field', metric: 'Air temperature', value: '24°C', state: 'Optimal' },
    { id: 'sensor-3', field: 'River beds', metric: 'Soil moisture', value: '54%', state: 'Check soon' },
  ],
};

const safeUser = () => {
  try {
    return JSON.parse(localStorage.getItem('farmcraft_user') || 'null');
  } catch {
    return null;
  }
};

export const loadFarmDashboard = async () => {
  const token = localStorage.getItem('token');
  const user = safeUser();

  const liveResults = token
    ? await Promise.allSettled([
        fetchProductsAPI({ size: 5 }),
        user?.id ? fetchNotificationsAPI({ userId: user.id, page: 0, size: 5 }) : Promise.resolve(null),
      ])
    : [];

  const hasLiveData = liveResults.some((result) => result.status === 'fulfilled' && result.value !== null);

  return {
    ...DEMO_DASHBOARD,
    isUsingDemoData: !hasLiveData,
  };
};

export const createFarmCrop = async (crop) => {
  const payload = {
    ...crop,
    id: crop?.id ?? `local-${Date.now()}`,
  };

  return payload;
};

export const subscribeToFarmcraftNewsletter = async (email) => {
  const normalizedEmail = String(email || '').trim();
  if (!normalizedEmail) {
    throw new Error('An email address is required.');
  }

  return { ok: true, email: normalizedEmail };
};

export const demoCropTemplate = DEMO_DASHBOARD.crops[0];