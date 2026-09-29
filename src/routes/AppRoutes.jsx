import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/layout/CartDrawer';
import { NotificationDropdown } from '../components/layout/NotificationDropdown';
import { DashboardSidebar } from '../components/layout/DashboardSidebar';
import { useStore } from '../context/StoreContext';

import { HomePage } from '../pages/HomePage';
import { ProductsPage } from '../pages/ProductsPage';
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
import { AdminDashboardPage } from '../pages/dashboard/AdminDashboardPage';
import { ProductManagementPage } from '../pages/dashboard/ProductManagementPage';
import { InventoryPage } from '../pages/dashboard/InventoryPage';
import { OrdersManagementPage } from '../pages/dashboard/OrdersManagementPage';

// Main Public Layout Wrapper
const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
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

// Admin / Seller Dashboard Layout Wrapper
const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <NotificationDropdown />
      <CartDrawer />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>
        <div className="flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
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
    <Routes>
      {/* Public Pages Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success/:id" element={<OrderSuccessPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Admin & Seller Dashboard Layout */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardIndex />} />
        <Route path="/dashboard/seller" element={<SellerDashboardPage />} />
        <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
        <Route path="/dashboard/products" element={<ProductManagementPage />} />
        <Route path="/dashboard/inventory" element={<InventoryPage />} />
        <Route path="/dashboard/orders" element={<OrdersManagementPage />} />
      </Route>
    </Routes>
  );
};
