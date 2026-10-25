'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BrandLogo from '@/components/BrandLogo';
import { useApp } from '@/context/AppContext';
import { calculateAgeFromDob, EXPERIENCE_MODES } from '@/lib/agePolicy';
import { Mail, Lock, User, Calendar, AlertCircle, Sparkles, Check, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { registerWithEmail, t } = useApp();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthdate, setBirthdate] = useState('2005-01-01');
  const [experienceMode, setExperienceMode] = useState(EXPERIENCE_MODES.MATURE);
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const calculatedAge = calculateAgeFromDob(birthdate);
  const isUnder18 = calculatedAge !== null && calculatedAge < 18;
  const isUnder13 = calculatedAge !== null && calculatedAge < 13;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim() || !birthdate) {
      setErrorMessage('Please fill in all required fields including your Date of Birth.');
      return;
    }
    if (isUnder13) {
      setErrorMessage('You must be at least 13 years of age to register on Avora Library.');
      return;
    }
    if (!isAgeConfirmed) {
      setErrorMessage('Please confirm that you meet the platform terms and age confirmation.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const finalMode = isUnder18 ? EXPERIENCE_MODES.KIDS : experienceMode;

    try {
      // Set server-level age verification cookies
      await fetch('/api/user/age-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthdate,
          experienceMode: finalMode
        })
      });

      const registered = registerWithEmail({
        username,
        email,
        password,
        birthdate,
        age: calculatedAge,
        experienceMode: finalMode,
        isAgeConfirmed
      });

      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail === 'gbncircle@gmail.com') {
        router.push('/admin', { scroll: false });
      } else {
        router.push('/home', { scroll: false });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-lg w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center pb-2">
              <BrandLogo size="lg" />
            </div>
            <h1 className="text-2xl font-black">Create Your Account</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              One account with DOB-based age verification for age-appropriate reading access.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* REGISTRATION FORM */}
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 dark:text-amber-400" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="e.g. ElenaWrites"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold text-sm outline-none focus:border-brand-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-amber-400/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 dark:text-amber-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold text-sm outline-none focus:border-brand-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-amber-400/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 dark:text-amber-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold text-sm outline-none focus:border-brand-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-amber-400/20 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Date of Birth & Live Age Calculation */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Date of Birth (DOB) <span className="text-rose-500">*</span>
                </label>
                {/* Quick DOB Testing Presets */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setBirthdate('2003-05-15')}
                    className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold hover:bg-emerald-100 cursor-pointer"
                    title="Set to Adult (21 years old)"
                  >
                    ⚡ Adult 21+
                  </button>
                  <button
                    type="button"
                    onClick={() => setBirthdate('2009-08-20')}
                    className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[10px] font-bold hover:bg-amber-100 cursor-pointer"
                    title="Set to Teen (15 years old - minor)"
                  >
                    ⚡ Teen 15+
                  </button>
                </div>
              </div>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 dark:text-amber-400" />
                <input 
                  type="date" 
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white outline-none focus:border-brand-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-amber-400/20 text-xs font-bold transition-all shadow-inner"
                />
              </div>

              {calculatedAge !== null && (
                <div className="flex items-center justify-between text-[11px] px-1 pt-0.5">
                  <span className="text-slate-500 dark:text-slate-400">
                    Calculated Age: <strong className="text-slate-900 dark:text-white">{calculatedAge} years old</strong>
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded-full ${
                    isUnder18 
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {isUnder18 ? 'Under 18 (Minor)' : '18+ (Adult)'}
                  </span>
                </div>
              )}
            </div>

            {/* Choose Your Experience */}
            <div className="space-y-2 pt-1">
              <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                Choose Your Experience
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Kids / Family */}
                <div 
                  onClick={() => setExperienceMode(EXPERIENCE_MODES.KIDS)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    experienceMode === EXPERIENCE_MODES.KIDS || isUnder18
                      ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/20 shadow-sm ring-1 ring-brand-500/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500" /> Kids / Family
                    </span>
                    {(experienceMode === EXPERIENCE_MODES.KIDS || isUnder18) && (
                      <div className="w-4.5 h-4.5 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    Kids Books, Educational Stories, and age-appropriate Fantasy. Mature content is hidden.
                  </p>
                </div>

                {/* 18+ / Mature */}
                <div 
                  onClick={() => {
                    if (!isUnder18) setExperienceMode(EXPERIENCE_MODES.MATURE);
                  }}
                  className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-2 relative ${
                    isUnder18
                      ? 'opacity-60 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                      : experienceMode === EXPERIENCE_MODES.MATURE
                        ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 shadow-sm ring-1 ring-amber-500/40 cursor-pointer'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      {isUnder18 ? <Lock className="w-4 h-4 text-slate-400" /> : <ShieldCheck className="w-4 h-4 text-amber-500" />} 18+ / Mature
                    </span>
                    {!isUnder18 && experienceMode === EXPERIENCE_MODES.MATURE && (
                      <div className="w-4.5 h-4.5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    {isUnder18 && (
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    Full general catalog: Fantasy, Romance, Thriller, and 18+ classified works.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5 font-normal">
                <span className="font-semibold text-slate-800 dark:text-slate-200">* Note:</span> Content access is primarily controlled by the DOB stored in your account. Users under 18 cannot unlock 18+ mature content.
              </p>
            </div>

            {/* Age Confirmation */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={isAgeConfirmed}
                  onChange={(e) => setIsAgeConfirmed(e.target.checked)}
                  required
                  className="w-4 h-4 mt-0.5 accent-brand-500 rounded"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                  I confirm that the Date of Birth provided is accurate, and I agree to Avora Library&apos;s Terms of Service and Privacy Policy.
                </span>
              </label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-bold shadow-lg shadow-brand-500/25 transition-all cursor-pointer mt-2"
            >
              {loading ? 'Creating Account & Verifying DOB...' : 'Complete Registration & Join Avora'}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-brand-500 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
