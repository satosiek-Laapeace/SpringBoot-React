import React, { useEffect, useState } from 'react';
import { AlertCircle, Camera, CheckCircle2, LoaderCircle, Settings2, UserRound } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { updateUserProfileAPI, uploadUserProfilePictureAPI } from '../../features/user-profile/services/profileApi';
import { fetchMarketplaceSettingsAPI } from '../../features/settings/services/marketplaceSettingsApi';

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
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
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
        if (!result || typeof result.abaPaywayPaymentsEnabled !== 'boolean') {
          throw new Error('The marketplace settings service returned an unsupported response.');
        }
        setSettings(result);
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Settings2 className="h-5 w-5" /></span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{t('settingsPaymentMethods')}</h2>
              <p className="text-xs text-slate-500">ABA PayWay is the only supported checkout provider.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div role="status" className="flex min-h-40 items-center justify-center text-sm text-slate-500"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />{t('settingsLoading')}</div>
        ) : (
          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">ABA PayWay</p>
            <p role={settings?.abaPaywayPaymentsEnabled ? 'status' : 'alert'} className={`mt-1 text-xs ${settings?.abaPaywayPaymentsEnabled ? 'text-emerald-700' : 'text-amber-700'}`}>
              {settings?.abaPaywayPaymentsEnabled
                ? 'Configured and available for checkout.'
                : 'Unavailable. Configure the ABA merchant credentials and callback URLs in the backend environment.'}
            </p>
          </div>
        )}
      </section>
    </main>
  );
};
