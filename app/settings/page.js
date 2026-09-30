'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { Settings, ShieldCheck, KeyRound, Bell, CheckCircle, Sparkles, CreditCard, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const { user, setUser, subscription, cancelSubscription, openPaymentModal, featureFlags, t } = useApp();
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

        {/* VIP Membership & Billing Management Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base">VIP Membership & Billing</h3>
            </div>
            {subscription?.active ? (
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 border border-emerald-500/20">
                Active VIP Pass
              </span>
            ) : (
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                Standard Free Tier
              </span>
            )}
          </div>

          {subscription?.active ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400 capitalize">
                    {subscription.plan} VIP Member
                  </span>
                  <span className="text-[11px] text-slate-500">Renews: {subscription.renewDate || 'Next month'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  <span className="font-mono capitalize font-bold">{subscription.cardBrand || 'Card'} ending in •••• {subscription.cardLast4 || '4242'}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-slate-500 text-[11px]">
                <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">Active Benefits:</p>
                <p>✓ Unlimited serialized novels reading with zero ad interruptions</p>
                <p>✓ Exclusive Gold Patron badge displayed on your profile and comments</p>
                <p>✓ Early access to newly published serialized chapters</p>
                <p>✓ Direct contribution to serialized authors and platform servers</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel your VIP subscription? You will continue with free access.')) {
                      cancelSubscription();
                    }
                  }}
                  className="px-5 py-2.5 rounded-full border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel VIP Membership
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <p className="text-slate-500 leading-relaxed">
                Enjoy an enhanced storytelling experience with Avora Library VIP. Read with zero interruptions, get exclusive profile badges, and directly support independent authors.
              </p>
              
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => openPaymentModal({ type: 'subscribe', plan: 'monthly' })}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  Upgrade to Monthly VIP ($5.99/mo)
                </button>
                <button
                  onClick={() => openPaymentModal({ type: 'subscribe', plan: 'annual' })}
                  className="px-6 py-2.5 rounded-full border border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-bold text-xs transition-all cursor-pointer"
                >
                  Annual Pass ($49.99/yr • Save 30%)
                </button>
              </div>
            </div>
          )}
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
