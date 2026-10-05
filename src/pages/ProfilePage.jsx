import React, { useEffect, useState } from 'react';
import {
  Camera, Package, MapPin, Star, User, Plus, Edit2,
  ChevronRight, ShoppingBag, Clock, CheckCircle, XCircle, TruckIcon, LogOut, KeyRound, MailCheck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { forgotPasswordAPI, resetPasswordAPI } from '../features/auth/services/authApi';
import { PasswordField } from '../features/auth/components/PasswordField';
import {
  createAddressAPI,
  deleteAddressAPI,
  fetchAddressesAPI,
  setDefaultAddressAPI,
  updateAddressAPI,
  updateUserProfileAPI,
  uploadUserProfilePictureAPI,
} from '../features/user-profile/services/profileApi';
import { fetchMyOrdersAPI } from '../features/orders/services/orderApi';
import { fetchAllMyReviewsAPI } from '../features/reviews/services/reviewApi';
import { useLanguage } from '../context/LanguageContext';
import { Pagination } from '../components/common/Pagination';
import { GoogleAddressPicker } from '../components/common/GoogleAddressPicker';
import { usePagination } from '../hooks/usePagination';

const statusConfig = {
  PENDING: { label: 'Pending', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  CONFIRMED: { label: 'Confirmed', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  PROCESSING: { label: 'Processing', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: TruckIcon },
  SHIPPED: { label: 'Shipped', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: TruckIcon },
  DELIVERED: { label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
};

const EMPTY_ADDRESS = {
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'Cambodia',
  deliveryInstructions: '',
  isDefault: false,
  latitude: '',
  longitude: '',
  googlePlaceId: '',
  formattedAddress: '',
};

const EMPTY_USER = {};

const getOrderDate = (order) => {
  const timestamp = order.createdAt || order.created_at || order.deliveryTime || order.delivery_time;
  if (!timestamp) return 'Date not provided';
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? 'Date not provided' : date.toLocaleString();
};

const getOrderItemsLabel = (order) => {
  const items = Array.isArray(order.items) ? order.items : [];
  return items.map((item) => {
    const name = item.productName || item.product_name || item.product?.name || 'Product';
    const quantity = Number(item.quantity || 0);
    return `${quantity}× ${name}`;
  }).join(', ') || 'No item details available';
};

const PROFILE_TABS = [
  { id: 'orders',        label: 'My Orders',       icon: Package },
  { id: 'address',       label: 'Address Book',    icon: MapPin },
  { id: 'reviews',       label: 'My Reviews',      icon: Star },
  { id: 'account',       label: 'Account',         icon: User },
];

export const ProfilePage = () => {
  const { currentUser } = useStore();
  const { t } = useLanguage();
  const { signOut, updateCurrentUserProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [pictureLoadFailed, setPictureLoadFailed] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  const user = currentUser || EMPTY_USER;
  const profileTabs = user.role === 'BUYER'
    ? PROFILE_TABS
    : PROFILE_TABS.filter(({ id }) => id !== 'orders');
  const displayName = user.full_name || user.fullName || user.name || user.username || '';
  const initials = displayName.slice(0, 2).toUpperCase();
  const [profileOrders, setProfileOrders] = useState([]);
  const [profileReviews, setProfileReviews] = useState([]);
  const [profileAddresses, setProfileAddresses] = useState([]);
  const orderPage = usePagination(profileOrders);
  const reviewPage = usePagination(profileReviews);
  const addressPage = usePagination(profileAddresses);
  const [profileDataLoading, setProfileDataLoading] = useState(true);
  const [profileDataErrors, setProfileDataErrors] = useState({});
  const [addressEditorOpen, setAddressEditorOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);
  const [savingAddress, setSavingAddress] = useState(false);
  const [passwordCodeSent, setPasswordCodeSent] = useState(false);
  const [sendingPasswordCode, setSendingPasswordCode] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ code: '', newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState(null);

  useEffect(() => {
    setProfileForm({
      name: user.full_name || user.fullName || user.name || user.username || '',
      email: user.email || '',
    });
    setProfilePictureUrl(user.profilePictureUrl || user.profile_picture_url || user.picture || user.imageUrl || '');
    setPictureLoadFailed(false);
  }, [user]);

  useEffect(() => {
    let active = true;
    setProfileDataLoading(true);
    setProfileDataErrors({});
    setProfileAddresses([]);
    setProfileOrders([]);
    setProfileReviews([]);

    const requests = [
      fetchAddressesAPI(),
      user.role === 'BUYER' ? fetchMyOrdersAPI() : Promise.resolve([]),
      user.role === 'BUYER' ? fetchAllMyReviewsAPI() : Promise.resolve([]),
    ];
    Promise.allSettled(requests).then(([addressResult, orderResult, reviewResult]) => {
      if (!active) return;
      const failures = {};
      if (addressResult.status === 'fulfilled' && Array.isArray(addressResult.value)) {
        setProfileAddresses(addressResult.value);
      } else {
        failures.addresses = 'Saved addresses could not be loaded. Please try again.';
      }
      if (orderResult.status === 'fulfilled' && Array.isArray(orderResult.value)) {
        setProfileOrders(orderResult.value);
      } else {
        failures.orders = 'Your orders could not be loaded. Please try again.';
      }
      if (reviewResult.status === 'fulfilled' && Array.isArray(reviewResult.value)) {
        setProfileReviews(reviewResult.value);
      } else {
        failures.reviews = 'Your reviews could not be loaded. Please try again.';
      }
      setProfileDataErrors(failures);
    }).finally(() => {
      if (active) setProfileDataLoading(false);
    });

    return () => { active = false; };
  }, [user.id, user.role]);

  const refreshAddresses = async () => {
    const result = await fetchAddressesAPI();
    if (!Array.isArray(result)) throw new Error('The server returned an invalid address list.');
    setProfileAddresses(result);
  };

  const openAddressEditor = (address) => {
    setEditingAddressId(address?.id ?? null);
    setAddressForm(address ? {
      street: address.street || address.street_address || '',
      city: address.city || '',
      state: address.state || '',
      zip: address.zip || address.postal_code || '',
      country: address.country || 'Cambodia',
      deliveryInstructions: address.deliveryInstructions || address.delivery_instructions || '',
      isDefault: Boolean(address.isDefault ?? address.is_default),
      latitude: address.latitude ?? '',
      longitude: address.longitude ?? '',
      googlePlaceId: address.googlePlaceId || address.google_place_id || '',
      formattedAddress: address.formattedAddress || address.formatted_address || '',
    } : EMPTY_ADDRESS);
    setAddressEditorOpen(true);
    setProfileMessage(null);
  };

  const handleAddressSave = async (event) => {
    event.preventDefault();
    setSavingAddress(true);
    setProfileMessage(null);
    const payload = {
      ...addressForm,
      latitude: addressForm.latitude === '' ? null : Number(addressForm.latitude),
      longitude: addressForm.longitude === '' ? null : Number(addressForm.longitude),
    };
    try {
      if ((payload.latitude == null) !== (payload.longitude == null)) {
        throw new Error('Enter both latitude and longitude, or leave both blank.');
      }
      if (String(payload.country || '').trim().toLowerCase() !== 'cambodia') {
        throw new Error(t('addressCountryCambodia'));
      }
      if (payload.latitude != null && (payload.latitude < 9.5 || payload.latitude > 14.8 || payload.longitude < 102.3 || payload.longitude > 107.7)) {
        throw new Error(t('addressCoordinatesCambodia'));
      }
      if (editingAddressId) await updateAddressAPI(editingAddressId, payload);
      else await createAddressAPI(payload);
      await refreshAddresses();
      setAddressEditorOpen(false);
      setProfileMessage({ type: 'success', text: 'Your address has been saved.' });
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.message || 'Your address could not be saved.' });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (id) => {
    setProfileMessage(null);
    try {
      await setDefaultAddressAPI(id);
      await refreshAddresses();
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.message || 'The default address could not be changed.' });
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this saved address?')) return;
    setProfileMessage(null);
    try {
      await deleteAddressAPI(id);
      await refreshAddresses();
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.message || 'The address could not be deleted.' });
    }
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    if (!user.id) {
      setProfileMessage({ type: 'error', text: 'Your account could not be identified. Sign in again and retry.' });
      return;
    }

    setSavingProfile(true);
    setProfileMessage(null);
    try {
      const updatedUser = await updateUserProfileAPI(user.id, {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
      });
      updateCurrentUserProfile(updatedUser);
      setProfileMessage({ type: 'success', text: 'Your profile has been updated.' });
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.message || 'Your profile could not be updated.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordCodeRequest = async () => {
    if (!user.email) {
      setPasswordMessage({ type: 'error', text: 'Add an email address to your account before changing its password.' });
      return;
    }
    setSendingPasswordCode(true);
    setPasswordMessage(null);
    try {
      const result = await forgotPasswordAPI(user.email);
      setPasswordCodeSent(true);
      setPasswordMessage({
        type: 'success',
        text: result?.message || 'If an account with this email exists, a verification code has been sent.',
      });
    } catch (error) {
      setPasswordMessage({ type: 'error', text: error.message || 'Could not send a verification code.' });
    } finally {
      setSendingPasswordCode(false);
    }
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'The new passwords do not match.' });
      return;
    }
    setSavingPassword(true);
    setPasswordMessage(null);
    try {
      await resetPasswordAPI({
        email: user.email,
        otp: passwordForm.code.trim(),
        newPassword: passwordForm.newPassword,
      });
      setPasswordCodeSent(false);
      setPasswordForm({ code: '', newPassword: '', confirmPassword: '' });
      setPasswordMessage({ type: 'success', text: 'Your password has been changed successfully.' });
    } catch (error) {
      setPasswordMessage({ type: 'error', text: error.message || 'Your password could not be changed.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePictureChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileMessage({ type: 'error', text: 'Choose an image file for your profile picture.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileMessage({ type: 'error', text: 'Profile pictures must be 5 MB or smaller.' });
      return;
    }
    if (!user.id) {
      setProfileMessage({ type: 'error', text: 'Your account could not be identified. Sign in again and retry.' });
      return;
    }

    setUploadingPicture(true);
    setProfileMessage(null);
    try {
      const updatedUser = await uploadUserProfilePictureAPI(user.id, file);
      updateCurrentUserProfile(updatedUser);
      setProfilePictureUrl(updatedUser.profilePictureUrl || '');
      setPictureLoadFailed(false);
      setProfileMessage({ type: 'success', text: 'Your profile picture has been updated.' });
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.message || 'Your profile picture could not be uploaded.' });
    } finally {
      setUploadingPicture(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── SIDEBAR ────────────────────────────────────── */}
          <aside className="lg:w-72 flex-shrink-0 space-y-4">
            {/* Profile Card */}
            <div className="bg-white dark:bg-[#0e261b] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-[#1b4332] to-[#2d6a4f]" />
              <div className="px-5 pb-5 -mt-8">
                <div className="relative h-16 w-16">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[#d4a373] text-xl font-bold text-[#1b4332] ring-4 ring-white shadow-lg">
                    {profilePictureUrl && !pictureLoadFailed ? (
                      <img src={profilePictureUrl} alt={`${displayName} profile`} className="h-full w-full object-cover" onError={() => setPictureLoadFailed(true)} />
                    ) : initials}
                  </div>
                  <label htmlFor="profile-picture" title="Change profile picture" className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#1b4332] text-white shadow-sm hover:bg-[#2d6a4f]">
                    <Camera className="h-3.5 w-3.5" />
                  </label>
                  <input id="profile-picture" type="file" accept="image/*" className="sr-only" onChange={handlePictureChange} disabled={uploadingPicture} />
                </div>
                <div className="mt-3">
                  <p className="font-bold text-gray-900 text-base">{displayName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                  <span className="mt-2 inline-block px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {user.role || 'Buyer'} account
                  </span>
                  {uploadingPicture && <p role="status" className="mt-2 text-xs text-[#496a43]">Uploading picture...</p>}
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="bg-white dark:bg-[#0e261b] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-2">
              {profileTabs.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer mb-0.5 last:mb-0 ${
                      isActive
                        ? 'bg-[#1b4332] text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      {label}
                    </span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                  </button>
                );
              })}
              <div className="border-t border-gray-100 dark:border-white/8 mt-1 pt-1">
                <button onClick={async () => { await signOut(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </nav>

            {/* Stats mini */}
            <div className="bg-white dark:bg-[#0e261b] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-4 grid grid-cols-3 gap-2 text-center">
              {[
                ...(user.role === 'BUYER' ? [[profileOrders.length, 'Orders']] : []),
                [profileReviews.length, 'Reviews'],
                [profileAddresses.length, 'Addresses'],
              ].map(([n, l]) => (
                <div key={l} className="space-y-0.5">
                  <p className="text-xl font-bold text-[#1b4332] dark:text-[#40916c]">{n}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">{l}</p>
                </div>
              ))}
            </div>
          </aside>

          {/* ── MAIN CONTENT ───────────────────────────────── */}
          <main className="flex-1 space-y-6">

            {/* ORDERS TAB */}
            {user.role === 'BUYER' && activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{profileOrders.length} total orders</span>
                </div>
                {profileDataErrors.orders ? <p role="alert" className="py-8 text-center text-sm text-red-700">{profileDataErrors.orders}</p> : profileDataLoading ? <p role="status" className="py-8 text-sm text-gray-500">Loading your orders...</p> : (
                  profileOrders.length ? orderPage.paginatedItems.map((order) => {
                    const status = String(order.status || 'PENDING').toUpperCase();
                    const s = statusConfig[status] || statusConfig.PENDING;
                    const StatusIcon = s.icon;
                    return (
                      <div key={order.id} className="bg-white dark:bg-[#0e261b] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                              <ShoppingBag className="w-6 h-6 text-[#1b4332] dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="font-bold text-[#1b4332] dark:text-[#40916c] text-sm">Order #{order.id}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{getOrderItemsLabel(order)}</p>
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1.5">
                                <Clock className="w-3 h-3" /> {getOrderDate(order)}{order.deliverySlot ? ` · ${order.deliverySlot}` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 space-y-2">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">${Number(order.totalAmount ?? order.total_amount ?? 0).toFixed(2)}</p>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.color}`}>
                              <StatusIcon className="w-3 h-3" /> {s.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }) : <p className="py-8 text-center text-sm text-gray-500">No orders are associated with this account yet.</p>
                )}
                {!profileDataLoading && !profileDataErrors.orders && <Pagination currentPage={orderPage.currentPage} pageCount={orderPage.pageCount} totalItems={orderPage.totalItems} pageSize={orderPage.pageSize} onPageChange={orderPage.setCurrentPage} onPageSizeChange={orderPage.setPageSize} t={t} />}
              </div>
            )}

            {/* ADDRESS TAB */}
            {activeTab === 'address' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Address Book</h1>
                  <button type="button" onClick={() => openAddressEditor()} className="flex items-center gap-1.5 bg-[#1b4332] hover:bg-[#2d6a4f] text-white px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm">
                    <Plus className="w-4 h-4" /> Add Address
                  </button>
                </div>

                {profileMessage && <p role={profileMessage.type === 'error' ? 'alert' : 'status'} className={`text-sm ${profileMessage.type === 'error' ? 'text-red-700' : 'text-emerald-700'}`}>{profileMessage.text}</p>}
                {profileDataErrors.addresses && <p role="alert" className="text-sm text-red-700">{profileDataErrors.addresses}</p>}
                {profileDataLoading ? <p role="status" className="py-8 text-sm text-gray-500">Loading saved addresses...</p> : null}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addressPage.paginatedItems.map((addr) => (
                    <div
                      key={addr.id}
                      className={`bg-white dark:bg-[#0e261b] rounded-2xl border-2 p-5 relative group transition-all ${
                        Boolean(addr.isDefault ?? addr.is_default)
                          ? 'border-[#1b4332] dark:border-[#40916c]'
                          : 'border-gray-100 dark:border-white/8 hover:border-gray-300 dark:hover:border-white/20'
                      }`}
                    >
                      {Boolean(addr.isDefault ?? addr.is_default) && (
                        <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 bg-[#1b4332] text-white rounded-full">Default</span>
                      )}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="w-5 h-5 text-[#1b4332] dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{Boolean(addr.isDefault ?? addr.is_default) ? 'Default delivery address' : 'Delivery address'}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                            {addr.formattedAddress || addr.formatted_address || `${addr.street || addr.street_address || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zip || addr.postal_code || ''}, ${addr.country || ''}`}
                          </p>
                          {addr.deliveryInstructions && <p className="mt-2 text-xs text-gray-500">Delivery instructions: {addr.deliveryInstructions}</p>}
                          {addr.latitude != null && addr.longitude != null && <p className="mt-1 text-[11px] text-gray-400">Coordinates: {addr.latitude}, {addr.longitude}</p>}
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button type="button" onClick={() => openAddressEditor(addr)} className="flex items-center gap-1 text-xs font-semibold text-[#1b4332] dark:text-[#40916c] hover:underline cursor-pointer transition-colors">
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        {!Boolean(addr.isDefault ?? addr.is_default) && <button type="button" onClick={() => handleSetDefaultAddress(addr.id)} className="text-xs font-semibold text-gray-500 hover:text-[#1b4332] cursor-pointer transition-colors ml-2">Set default</button>}
                        <button type="button" onClick={() => handleDeleteAddress(addr.id)} className="text-xs font-semibold text-gray-400 hover:text-red-500 cursor-pointer transition-colors ml-2">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
                {!profileDataLoading && !profileDataErrors.addresses && <Pagination currentPage={addressPage.currentPage} pageCount={addressPage.pageCount} totalItems={addressPage.totalItems} pageSize={addressPage.pageSize} onPageChange={addressPage.setCurrentPage} onPageSizeChange={addressPage.setPageSize} t={t} />}
                {!profileDataLoading && !profileDataErrors.addresses && profileAddresses.length === 0 && <p className="rounded-xl border border-dashed border-gray-200 px-5 py-10 text-center text-sm text-gray-500">No saved addresses. Add a delivery address to use at checkout.</p>}
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Reviews</h1>
                {profileDataErrors.reviews ? <p role="alert" className="py-8 text-center text-sm text-red-700">{profileDataErrors.reviews}</p> : profileDataLoading ? <p role="status" className="py-8 text-sm text-gray-500">Loading your reviews...</p> : reviewPage.paginatedItems.map((rev) => (
                  <div key={rev.id} className="bg-white dark:bg-[#0e261b] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{rev.productName || rev.product?.name || rev.product_name || `Product #${rev.productId || rev.product_id || ''}`}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(Number(rev.rating || 0)) ? 'fill-[#d4a373] text-[#d4a373]' : 'text-gray-300 dark:text-gray-600'}`} />
                          ))}
                          <span className="text-xs font-bold text-[#d4a373] ml-1">{rev.rating}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed italic">"{rev.comment || rev.content || ''}"</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{getOrderDate({ createdAt: rev.createdAt || rev.created_at })}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {!profileDataLoading && !profileDataErrors.reviews && <Pagination currentPage={reviewPage.currentPage} pageCount={reviewPage.pageCount} totalItems={reviewPage.totalItems} pageSize={reviewPage.pageSize} onPageChange={reviewPage.setCurrentPage} onPageSizeChange={reviewPage.setPageSize} t={t} />}
                {!profileDataLoading && profileReviews.length === 0 && <p className="py-8 text-center text-sm text-gray-500">No reviews are associated with this account yet.</p>}
              </div>
            )}

            {/* ACCOUNT TAB */}
            {activeTab === 'account' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
                <form onSubmit={handleProfileSave} className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div>
                    <label htmlFor="profile-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Full name</label>
                    <input id="profile-name" type="text" required maxLength={50} value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-[#1b4332] focus:outline-none focus:ring-2 focus:ring-[#1b4332]/10" />
                  </div>
                  <div>
                    <label htmlFor="profile-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Email address</label>
                    <input id="profile-email" type="email" required value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-[#1b4332] focus:outline-none focus:ring-2 focus:ring-[#1b4332]/10" />
                  </div>
                  {profileMessage && <p role={profileMessage.type === 'error' ? 'alert' : 'status'} className={`text-sm ${profileMessage.type === 'error' ? 'text-red-700' : 'text-emerald-700'}`}>{profileMessage.text}</p>}
                  <button type="submit" disabled={savingProfile} className="rounded-xl bg-[#1b4332] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#2d6a4f] disabled:cursor-wait disabled:opacity-60">
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>

                <section aria-labelledby="password-security-title" className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#1b4332]">
                      <KeyRound className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 id="password-security-title" className="text-base font-bold text-gray-900">Password &amp; security</h2>
                      <p className="mt-1 text-sm text-gray-500">Verify your email to set a new password.</p>
                      <p className="mt-1 text-xs font-medium text-gray-600">{user.email}</p>
                    </div>
                  </div>

                  {passwordMessage && (
                    <p role={passwordMessage.type === 'error' ? 'alert' : 'status'} className={`rounded-lg px-3 py-2 text-sm ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}>
                      {passwordMessage.text}
                    </p>
                  )}

                  {!passwordCodeSent ? (
                    <button type="button" onClick={handlePasswordCodeRequest} disabled={sendingPasswordCode || !user.email} className="inline-flex items-center gap-2 rounded-xl bg-[#1b4332] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#2d6a4f] disabled:cursor-wait disabled:opacity-60">
                      <MailCheck className="h-4 w-4" />
                      {sendingPasswordCode ? 'Sending code...' : 'Send verification code'}
                    </button>
                  ) : (
                    <form onSubmit={handlePasswordSave} className="space-y-4">
                      <label htmlFor="password-reset-code" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Email verification code
                        <input id="password-reset-code" name="otp" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={passwordForm.code} onChange={(event) => setPasswordForm((current) => ({ ...current, code: event.target.value.replace(/\D/g, '').slice(0, 6) }))} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm tracking-[0.25em] text-gray-900 outline-none focus:border-[#1b4332] focus:ring-2 focus:ring-[#1b4332]/10" />
                      </label>
                      <PasswordField id="new-profile-password" label="New password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} autoComplete="new-password" minLength={6} inputClassName="bg-gray-50 py-3 text-sm" />
                      <PasswordField id="confirm-profile-password" label="Confirm new password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} autoComplete="new-password" minLength={6} inputClassName="bg-gray-50 py-3 text-sm" />
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <button type="button" onClick={handlePasswordCodeRequest} disabled={sendingPasswordCode} className="text-sm font-semibold text-[#1b4332] hover:underline disabled:opacity-60">
                          {sendingPasswordCode ? 'Sending...' : 'Resend code'}
                        </button>
                        <button type="submit" disabled={savingPassword} className="rounded-xl bg-[#1b4332] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#2d6a4f] disabled:cursor-wait disabled:opacity-60">
                          {savingPassword ? 'Updating...' : 'Update password'}
                        </button>
                      </div>
                    </form>
                  )}
                </section>
              </div>
            )}

          </main>
        </div>
      </div>
      {addressEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4" role="presentation">
          <form onSubmit={handleAddressSave} className="my-auto w-full max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900" role="dialog" aria-modal="true" aria-labelledby="address-dialog-title">
            <div className="flex items-center justify-between gap-4">
              <h2 id="address-dialog-title" className="text-xl font-bold text-slate-900 dark:text-white">{editingAddressId ? 'Edit delivery address' : 'Add delivery address'}</h2>
              <button type="button" onClick={() => setAddressEditorOpen(false)} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Close</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <GoogleAddressPicker
                address={addressForm}
                onLocationSelect={(location) => setAddressForm(form => ({
                  ...form,
                  ...location,
                  latitude: String(location.latitude ?? ''),
                  longitude: String(location.longitude ?? ''),
                }))}
              />
              {[
                ['street', t('addressStreet'), true],
                ['city', t('addressCity'), true],
                ['state', t('addressProvince'), true],
                ['zip', t('addressPostalCode'), true],
                ['country', t('addressCountry'), true],
              ].map(([field, label, required]) => (
                <label key={field} className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {label}
                  <input required={required} maxLength={field === 'zip' ? 20 : undefined} value={addressForm[field]} onChange={(event) => setAddressForm((form) => ({ ...form, [field]: event.target.value }))} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </label>
              ))}
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:col-span-2">
                {t('deliveryInstructions')}
                <textarea maxLength={500} value={addressForm.deliveryInstructions} onChange={(event) => setAddressForm((form) => ({ ...form, deliveryInstructions: event.target.value }))} rows={2} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              </label>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t('addressLatitudeOptional')}
                <input type="number" min="9.5" max="14.8" step="any" value={addressForm.latitude} onChange={(event) => setAddressForm((form) => ({ ...form, latitude: event.target.value }))} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              </label>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t('addressLongitudeOptional')}
                <input type="number" min="102.3" max="107.7" step="any" value={addressForm.longitude} onChange={(event) => setAddressForm((form) => ({ ...form, longitude: event.target.value }))} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 sm:col-span-2">
                <input type="checkbox" checked={addressForm.isDefault} onChange={(event) => setAddressForm((form) => ({ ...form, isDefault: event.target.checked }))} className="h-4 w-4 accent-emerald-700" />
                {t('addressSetDefault')}
              </label>
            </div>
            {profileMessage?.type === 'error' && <p role="alert" className="text-sm text-red-700">{profileMessage.text}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setAddressEditorOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">{t('cancel')}</button>
              <button type="submit" disabled={savingAddress} className="rounded-lg bg-[#1b4332] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{savingAddress ? t('saving') : t('saveAddress')}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
