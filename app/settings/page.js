'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { Settings, ShieldCheck, KeyRound, Bell, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const { user, setUser, t } = useApp();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChanged, setPasswordChanged] = useState(false);

  // Settings
  const [hideMature, setHideMature] = useState(user?.hideMature || false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }
    setPasswordChanged(true);
    setTimeout(() => {
      setPasswordChanged(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 2500);
  };

  const handleSaveSettings = () => {
    setUser(prev => ({
      ...prev,
      hideMature
    }));
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-black">Account Settings & Security</h1>
          <p className="text-xs text-slate-400 mt-1">Manage your reading preferences, mature content filtering, and password</p>
        </div>

        {/* Content Preferences Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <ShieldCheck className="w-5 h-5 text-brand-500" />
            <h3 className="font-bold text-base">Reading & Safety Preferences</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div>
                <h4 className="font-bold text-sm">Hide Mature Content (18+)</h4>
                <p className="text-slate-400 mt-0.5">Filter out all stories with explicit violence or mature themes from your browse feeds and recommendations.</p>
              </div>
              <input 
                type="checkbox"
                checked={hideMature}
                onChange={(e) => setHideMature(e.target.checked)}
                className="w-5 h-5 accent-brand-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div>
                <h4 className="font-bold text-sm">Author Chapter Notifications</h4>
                <p className="text-slate-400 mt-0.5">Receive immediate in-app and email updates when an author you follow publishes a new chapter.</p>
              </div>
              <input 
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-5 h-5 accent-brand-500 cursor-pointer"
              />
            </div>

            {settingsSaved && (
              <p className="text-emerald-500 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Preferences saved!
              </p>
            )}

            <button 
              onClick={handleSaveSettings}
              className="px-6 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold"
            >
              Save Preferences
            </button>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <KeyRound className="w-5 h-5 text-brand-500" />
            <h3 className="font-bold text-base">Change Password</h3>
          </div>

          {passwordChanged && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Password updated successfully.
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-xs">
            <div>
              <label className="block font-bold text-slate-400 mb-1">Current Password</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
              />
            </div>

            <button 
              type="submit"
              className="px-6 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold"
            >
              Update Password
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
