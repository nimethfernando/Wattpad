'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Home, 
  Compass, 
  PenTool, 
  BookMarked, 
  User as UserIcon,
  Sparkles
} from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user, library = [], openAuthModal, t = {} } = useApp();

  // Hide bottom nav inside full-screen reading mode to give readers maximum canvas
  if (pathname?.startsWith('/read/')) {
    return null;
  }

  const navItems = [
    {
      label: t.home || 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/' || pathname === '/home'
    },
    {
      label: t.browse || 'Browse',
      href: '/browse',
      icon: Compass,
      isActive: pathname === '/browse'
    },
    {
      label: t.write || 'Write',
      href: '/write',
      icon: PenTool,
      isActive: pathname === '/write'
    },
    {
      label: t.library || 'Library',
      href: '/library',
      icon: BookMarked,
      badge: library.length > 0 ? library.length : null,
      isActive: pathname === '/library'
    },
    {
      label: user ? (t.profile || 'Profile') : (t.logIn || 'Log In'),
      href: user ? `/profile/${user.username}` : '#',
      icon: UserIcon,
      onClick: !user ? () => openAuthModal('login') : null,
      avatar: user?.avatar || null,
      isActive: Boolean(user && pathname === `/profile/${user.username}`)
    }
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 transition-colors shadow-lg shadow-black/5"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const activeClass = item.isActive
            ? 'text-brand-600 dark:text-brand-400 font-extrabold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium';

          if (item.onClick) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] transition-all relative cursor-pointer ${activeClass}`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${item.isActive ? 'scale-110' : ''}`} />
                </div>
                <span className="mt-0.5 tracking-tight truncate max-w-[60px]">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] transition-all relative ${activeClass}`}
            >
              <div className="relative">
                {item.avatar && item.isActive ? (
                  <img 
                    src={item.avatar} 
                    alt={user?.name || 'User'} 
                    className="w-5 h-5 rounded-full object-cover ring-2 ring-brand-500" 
                  />
                ) : (
                  <Icon className={`w-5 h-5 transition-transform ${item.isActive ? 'scale-110' : ''}`} />
                )}

                {item.badge && (
                  <span className="absolute -top-1 -right-2 min-w-3.5 h-3.5 px-1 rounded-full bg-brand-500 text-white text-[9px] font-black flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5 tracking-tight truncate max-w-[60px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

