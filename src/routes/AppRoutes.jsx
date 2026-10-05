import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/layout/CartDrawer';
import { NotificationDropdown } from '../components/layout/NotificationDropdown';
import { AdminConsoleLayout } from '../components/layout/AdminConsoleLayout';
import { SellerConsoleLayout } from '../components/layout/SellerConsoleLayout';
import { useStore } from '../context/StoreContext';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { AutoplayVideo } from '../components/common/AutoplayVideo';

import { HomePage } from '../pages/HomePage';
import { ProductsPage } from '../pages/ProductsPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrderSuccessPage } from '../pages/OrderSuccessPage';
import { ProfilePage } from '../pages/ProfilePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';

import { SellerDashboardPage } from '../pages/dashboard/SellerDashboardPage';
import { ProductManagementPage } from '../pages/dashboard/ProductManagementPage';
import { InventoryPage } from '../pages/dashboard/InventoryPage';
import { OrdersManagementPage } from '../pages/dashboard/OrdersManagementPage';
import { SecurityLogPage } from '../pages/dashboard/SecurityLogPage';

const SupplierStockLedgerPage = lazy(() =>
  import('../pages/dashboard/SupplierStockLedgerPage').then((module) => ({
    default: module.SupplierStockLedgerPage,
  }))
);

const AUTH_FARM_VIDEO_URL = 'https://videos.pexels.com/video-files/34755123/14733475_1920_1080_30fps.mp4';
const AUTH_FARM_POSTER = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1500&q=85';

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    let frame;
    let attempts = 0;
    const scrollToDestination = () => {
      const targetId = location.hash.slice(1);
      const target = targetId ? document.getElementById(targetId) : null;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (targetId && attempts < 12) {
        attempts += 1;
        frame = requestAnimationFrame(scrollToDestination);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    frame = requestAnimationFrame(scrollToDestination);

    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.search, location.hash]);

  return null;
};

const LegacySupplierStockRedirect = () => {
  const location = useLocation();
  const destination = location.hash === '#ledger'
    ? '/dashboard/admin/stock-movements'
    : '/dashboard/admin/suppliers';
  return <Navigate to={destination} replace />;
};

const AdminDashboardPage = lazy(() =>
  import('../pages/dashboard/AdminDashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  }))
);
const AdminCatalogPage = lazy(() =>
  import('../pages/dashboard/AdminCatalogPage').then((module) => ({
    default: module.AdminCatalogPage,
  }))
);
const AdminCategoriesPage = lazy(() =>
  import('../pages/dashboard/AdminCategoriesPage').then((module) => ({
    default: module.AdminCategoriesPage,
  }))
);
const AdminReviewsPage = lazy(() =>
  import('../pages/dashboard/AdminReviewsPage').then((module) => ({
    default: module.AdminReviewsPage,
  }))
);
const FinancialOperationsPage = lazy(() =>
  import('../pages/dashboard/FinancialOperationsPage').then((module) => ({
    default: module.FinancialOperationsPage,
  }))
);
const UserDirectoryPage = lazy(() =>
  import('../pages/dashboard/UserDirectoryPage').then((module) => ({
    default: module.UserDirectoryPage,
  }))
);
const AdminNotificationsPage = lazy(() =>
  import('../pages/dashboard/AdminNotificationsPage').then((module) => ({
    default: module.AdminNotificationsPage,
  }))
);
const AdminSettingsPage = lazy(() =>
  import('../pages/dashboard/AdminSettingsPage').then((module) => ({
    default: module.AdminSettingsPage,
  }))
);

// Main Public Layout Wrapper
const MainLayout = () => {
  return (
    <div className="storefront-layout min-h-screen flex flex-col bg-white text-slate-800">
      <Navbar />
      <NotificationDropdown />
      <CartDrawer />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const AuthLayout = () => (
  <div className="auth-layout min-h-svh bg-[#f4f4ef] p-3 sm:p-5 lg:flex lg:items-center lg:justify-center lg:p-8 dark:bg-[#0c1711]">
    <div className="mx-auto grid w-full max-w-[1240px] overflow-hidden rounded-[28px] border border-[#e7e5df] bg-[#fbfaf7] shadow-[0_24px_80px_rgba(20,36,28,0.12)] lg:grid-cols-2 dark:border-[#293b30] dark:bg-[#111f17]">
      <section className="auth-visual relative flex min-h-[230px] flex-col justify-between overflow-hidden p-6 sm:min-h-[280px] sm:p-8 lg:min-h-[calc(100svh-4rem)] lg:p-10">
        <AutoplayVideo
          src={AUTH_FARM_VIDEO_URL}
          poster={AUTH_FARM_POSTER}
          background
          className="inset-0 z-0 h-full w-full"
        />
        <div className="auth-visual__scrim" />
        <div className="relative z-10 flex items-center gap-3">
          <img
            src="/craftfarm-logo.png"
            alt=""
            className="h-11 w-11 rounded-full bg-white object-cover p-0.5 shadow-lg"
            data-motion="off"
          />
          <div className="leading-tight text-white">
            <p className="font-serif text-xl font-bold">CraftFarm</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">Fresh market</p>
          </div>
        </div>
        <div className="relative z-10 mt-8 max-w-lg text-white">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d8ed9b]" />
            GOOD FOOD, GROWN WITH CARE
          </p>
          <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            From the farm,
            <br />
            closer to home.
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/80">
            Meet local growers and bring fresh, thoughtfully grown food to your table.
          </p>
        </div>
      </section>
      <div className="flex items-center justify-center bg-[#f7f8f2] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 dark:bg-[#f7f8f2]">
        <div className="w-full max-w-[470px] rounded-[28px] border border-[#e8ebe4] bg-white px-5 py-6 shadow-[0_14px_40px_rgba(23,52,34,0.08)] sm:px-8 sm:py-8">
          <Outlet />
        </div>
      </div>
    </div>
  </div>
);

// Keep legacy seller URLs mapped into the separate admin console for admins.
const DashboardLayout = () => {
  const { activeRole } = useStore();
  const location = useLocation();
  const adminDestination = {
    '/dashboard': '/dashboard/admin',
    '/dashboard/seller': '/dashboard/admin',
    '/dashboard/supplier': '/dashboard/admin/suppliers',
    '/dashboard/products': '/dashboard/admin/catalog',
    '/dashboard/inventory': '/dashboard/admin/stock-movements',
    '/dashboard/orders': '/dashboard/admin/orders',
  }[location.pathname];

  if (activeRole === 'ADMIN' && adminDestination) {
    return <Navigate to={adminDestination} replace />;
  }

  return <SellerConsoleLayout />;
};

// Index Dashboard Dispatcher Route
const DashboardIndex = () => {
  const { activeRole } = useStore();
  if (activeRole === 'ADMIN') {
    return <Navigate to="/dashboard/admin" replace />;
  }
  return <Navigate to="/dashboard/seller" replace />;
};

export const AppRoutes = () => {
  return (
    <>
    <ScrollToTop />
    <Routes>
      {/* Public Pages Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<ProtectedRoute allowedRoles={['BUYER']}><CheckoutPage /></ProtectedRoute>} />
        <Route path="/order-success/:id" element={<ProtectedRoute allowedRoles={['BUYER']}><OrderSuccessPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Seller console uses a dedicated layout; admin tools remain in AdminConsoleLayout below. */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SELLER']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardIndex />} />
        <Route path="/dashboard/seller" element={<SellerDashboardPage />} />
        <Route path="/dashboard/products" element={<ProductManagementPage />} />
        <Route path="/dashboard/inventory" element={<InventoryPage />} />
        <Route path="/dashboard/orders" element={<OrdersManagementPage />} />
        <Route path="/dashboard/supplier" element={<Navigate to="/dashboard/inventory" replace />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminConsoleLayout /></ProtectedRoute>}>
        <Route
          path="/dashboard/admin"
          element={(
            <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading executive overview…</div>}>
              <AdminDashboardPage />
            </Suspense>
          )}
        />
        <Route
          path="/dashboard/admin/catalog"
          element={(
            <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading product catalog…</div>}>
              <AdminCatalogPage />
            </Suspense>
          )}
        />
        <Route
          path="/dashboard/admin/categories"
          element={(
            <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading categories…</div>}>
              <AdminCategoriesPage />
            </Suspense>
          )}
        />
        <Route
          path="/dashboard/admin/reviews"
          element={(
            <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading reviews…</div>}>
              <AdminReviewsPage />
            </Suspense>
          )}
        />
        <Route
          path="/dashboard/admin/notifications"
          element={(
            <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading notifications…</div>}>
              <AdminNotificationsPage />
            </Suspense>
          )}
        />
        <Route
          path="/dashboard/admin/settings"
          element={(
            <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading admin settings…</div>}>
              <AdminSettingsPage />
            </Suspense>
          )}
        />
        <Route path="/dashboard/admin/orders" element={<OrdersManagementPage />} />
        <Route path="/dashboard/admin/security-log" element={<SecurityLogPage />} />
        <Route
          path="/dashboard/admin/users"
          element={(
            <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading user directory…</div>}>
              <UserDirectoryPage />
            </Suspense>
          )}
        />
        <Route
          path="/dashboard/admin/finance"
          element={(
            <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading financial operations…</div>}>
              <FinancialOperationsPage />
            </Suspense>
          )}
        />
        <Route
          path="/dashboard/admin/suppliers"
          element={(
            <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading supplier directory…</div>}>
              <SupplierStockLedgerPage view="suppliers" />
            </Suspense>
          )}
        />
        <Route
          path="/dashboard/admin/stock-movements"
          element={(
            <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading stock movements…</div>}>
              <SupplierStockLedgerPage view="stock" />
            </Suspense>
          )}
        />
        <Route path="/dashboard/admin/suppliers-stock" element={<LegacySupplierStockRedirect />} />
      </Route>
    </Routes>
    </>
  );
};
