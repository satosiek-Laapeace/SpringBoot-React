import React, { useEffect, useState } from 'react';
import { AlertCircle, Camera, CheckCircle2, LoaderCircle, Save, Settings2, UserRound } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { updateUserProfileAPI, uploadUserProfilePictureAPI } from '../../features/user-profile/services/profileApi';
import {
  fetchMarketplaceSettingsAPI,
  updateMarketplaceSettingsAPI,
} from '../../features/settings/services/marketplaceSettingsApi';

const DEFAULT_SETTINGS = {
  cardPaymentsEnabled: true,
  khqrPaymentsEnabled: true,
  bankTransferEnabled: true,
  cashOnDeliveryEnabled: true,
};

const PAYMENT_OPTIONS = [
  { key: 'cardPaymentsEnabled', titleKey: 'settingsCardPayments', descriptionKey: 'settingsCardPaymentsDescription' },
  { key: 'khqrPaymentsEnabled', titleKey: 'settingsBakong', descriptionKey: 'settingsBakongDescription' },
  { key: 'bankTransferEnabled', titleKey: 'settingsBankTransfer', descriptionKey: 'settingsBankTransferDescription' },
  { key: 'cashOnDeliveryEnabled', titleKey: 'settingsCashDelivery', descriptionKey: 'settingsCashDeliveryDescription' },
];

export const AdminSettingsPage = () => {
  const { user, updateCurrentUserProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState(() => ({
    name: user?.full_name || user?.fullName || user?.displayName || user?.username || '',
    email: user?.email || '',
  }));
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [pictureLoadFailed, setPictureLoadFailed] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const profilePictureUrl = user?.profilePictureUrl || user?.profile_picture_url || user?.picture || user?.imageUrl || '';
  const displayName = profile.name || user?.username || 'Admin';
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    let active = true;
    fetchMarketplaceSettingsAPI()
      .then(result => {
        if (!active) return;
        if (!result || PAYMENT_OPTIONS.some(option => typeof result[option.key] !== 'boolean')) {
          throw new Error('The marketplace settings service returned an unsupported response.');
        }
        setSettings(result);
        setSettingsLoaded(true);
      })
      .catch(loadError => {
        if (active) setError(loadError.message || 'Marketplace settings could not be loaded.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const saveSettings = async event => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const savedSettings = await updateMarketplaceSettingsAPI(settings);
      setSettings(savedSettings);
      setNotice(t('settingsPaymentsSaved'));
    } catch (saveError) {
      setError(saveError.message || 'Marketplace settings could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async event => {
    event.preventDefault();
    if (!user?.id) {
      setError('Your admin account could not be identified. Sign in again and retry.');
      return;
    }
    setSavingProfile(true);
    setError('');
    setNotice('');
    try {
      const updatedUser = await updateUserProfileAPI(user.id, {
        name: profile.name.trim(),
        email: profile.email.trim(),
      });
      updateCurrentUserProfile(updatedUser);
      setNotice('Admin profile saved.');
    } catch (profileError) {
      setError(profileError.message || 'Admin profile could not be saved.');
    } finally {
      setSavingProfile(false);
    }
  };

  const changeProfilePicture = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file for your profile picture.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Profile pictures must be 5 MB or smaller.');
      return;
    }
    if (!user?.id) {
      setError('Your admin account could not be identified. Sign in again and retry.');
      return;
    }

    setUploadingPicture(true);
    setError('');
    setNotice('');
    try {
      const updatedUser = await uploadUserProfilePictureAPI(user.id, file);
      updateCurrentUserProfile(updatedUser);
      setPictureLoadFailed(false);
      setNotice('Admin profile picture updated.');
    } catch (pictureError) {
      setError(pictureError.message || 'Admin profile picture could not be uploaded.');
    } finally {
      setUploadingPicture(false);
    }
  };

  return (
    <main className="space-y-6 pb-10">
      <header>
        <p className="text-xs font-bold uppercase tracking-[.15em] text-emerald-700">{t('adminWorkspace')}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t('adminSettings')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('settingsDescription')}</p>
      </header>

      {error && <p role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}
      {notice && <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><CheckCircle2 className="h-4 w-4" />{notice}</p>}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-emerald-50 text-sm font-bold text-emerald-800 ring-2 ring-white">
              {profilePictureUrl && !pictureLoadFailed ? <img src={profilePictureUrl} alt={`${displayName} profile`} className="h-full w-full object-cover" onError={() => setPictureLoadFailed(true)} /> : <span>{initials || <UserRound className="h-5 w-5" />}</span>}
            </div>
            <label htmlFor="admin-profile-picture" title={t('settingsChangePicture')} className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-emerald-700 text-white shadow-sm hover:bg-emerald-800">
              {uploadingPicture ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
            </label>
            <input id="admin-profile-picture" type="file" accept="image/*" className="sr-only" onChange={changeProfilePicture} disabled={uploadingPicture} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{t('settingsAccountTitle')}</h2>
            <p className="text-xs text-slate-500">{t('settingsAccountDescription')}</p>
          </div>
        </div>
        <form onSubmit={saveProfile} className="mt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700">
              {t('settingsDisplayName')}
              <input value={profile.name} onChange={event => setProfile(current => ({ ...current, name: event.target.value }))} required minLength={2} maxLength={50} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500" />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              {t('colEmail')}
              <input type="email" value={profile.email} onChange={event => setProfile(current => ({ ...current, email: event.target.value }))} required className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500" />
            </label>
          </div>
          <button type="submit" disabled={savingProfile} className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-60">
            {savingProfile && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}{t('settingsSaveProfile')}
          </button>
        </form>
        <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-700">
            {t('settingsLanguage')}
            <select value={language} onChange={event => setLanguage(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500">
              <option value="en">English</option>
              <option value="km">ខ្មែរ</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Appearance
            <select value={theme} onChange={event => setTheme(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500">
              <option value="light">{t('settingsLight')}</option>
              <option value="dark">{t('settingsDark')}</option>
            </select>
          </label>
        </div>
        <p className="mt-3 text-[11px] text-slate-500">{t('settingsSavedLocally')}</p>
      </section>

      <form onSubmit={saveSettings} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Settings2 className="h-5 w-5" /></span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{t('settingsPaymentMethods')}</h2>
              <p className="text-xs text-slate-500">{t('settingsPaymentDescription')}</p>
            </div>
          </div>
          <button type="submit" disabled={loading || saving || !settingsLoaded} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? t('adminSaving') : t('settingsSavePayments')}
          </button>
        </div>

        {loading ? (
          <div role="status" className="flex min-h-40 items-center justify-center text-sm text-slate-500"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />{t('settingsLoading')}</div>
        ) : (
          <div className="mt-5 divide-y divide-slate-100">
            {PAYMENT_OPTIONS.map(option => (
              <label key={option.key} className="flex cursor-pointer items-center justify-between gap-4 py-4">
                <span>
                  <span className="block text-sm font-semibold text-slate-800">{t(option.titleKey)}</span>
                  <span className="mt-1 block text-xs text-slate-500">{t(option.descriptionKey)}</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings[option.key]}
                  onChange={event => setSettings(current => ({ ...current, [option.key]: event.target.checked }))}
                  disabled={saving}
                  className="h-4 w-4 shrink-0 accent-emerald-700"
                />
              </label>
            ))}
          </div>
        )}
      </form>
    </main>
  );
};
