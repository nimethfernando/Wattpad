'use client';
import { useApp } from '@/context/AppContext';

export default function BrandLogo({ size = 'default', showText = true, className = '', branding: propBranding = null }) {
  const app = useApp();
  const branding = propBranding || app?.cmsConfig?.branding;

  const rawLogo = branding?.logoUrl;
  const logoSrc =
    typeof rawLogo === 'object' && rawLogo !== null
      ? rawLogo.dataUrl || '/icon-192.png'
      : typeof rawLogo === 'string' && rawLogo.trim() && !rawLogo.includes('[object Object]')
      ? rawLogo.trim()
      : '/icon-192.png';

  const brandName = branding?.brandName !== undefined ? branding.brandName : 'Avora';
  const brandSubtitle = branding?.brandSubtitle !== undefined ? branding.brandSubtitle : 'Library';

  // Determine effective display mode:
  // Modes: 'full_image' (image only, no duplicate side text) | 'icon_and_text' (emblem + text) | 'text_only' (typography only)
  const isDefaultIcon = logoSrc === '/icon-192.png' || logoSrc === '/favicon.ico' || logoSrc === '/favicon.svg';

  let effectiveMode = branding?.logoMode;
  if (!effectiveMode) {
    if (branding?.showBrandText === false) {
      effectiveMode = 'full_image';
    } else if (branding?.showBrandText === true) {
      effectiveMode = 'icon_and_text';
    } else if (!isDefaultIcon) {
      // Custom uploaded logo or official combo logo (e.g. /logo.png, /logo-dark.png, data:image/...)
      // defaults to full_image to automatically prevent duplicate side text!
      effectiveMode = 'full_image';
    } else {
      effectiveMode = 'icon_and_text';
    }
  }

  const shouldRenderImage = effectiveMode !== 'text_only';
  const hasTextContent = (brandName || '').trim() !== '' || (brandSubtitle || '').trim() !== '';
  const shouldRenderText =
    showText &&
    effectiveMode !== 'full_image' &&
    branding?.showBrandText !== false &&
    hasTextContent;

  // Size mapping for icon and typography
  // In full_image mode, allow natural horizontal proportions so combined logos look balanced and crisp!
  const sizeMap = {
    sm: {
      icon: effectiveMode === 'full_image'
        ? 'h-7 sm:h-8 max-w-[170px] w-auto'
        : 'h-7 w-auto',
      title: 'text-lg',
      subtitle: 'text-[8.5px] tracking-[0.22em] mt-0.5'
    },
    default: {
      icon: effectiveMode === 'full_image'
        ? 'h-8 sm:h-9 md:h-10 max-w-[220px] sm:max-w-[260px] w-auto'
        : 'h-8 sm:h-9 md:h-10 w-auto',
      title: 'text-xl sm:text-2xl',
      subtitle: 'text-[9.5px] sm:text-[10px] tracking-[0.24em] mt-0.5'
    },
    lg: {
      icon: effectiveMode === 'full_image'
        ? 'h-10 sm:h-12 md:h-14 max-w-[300px] sm:max-w-[360px] w-auto'
        : 'h-10 sm:h-12 w-auto',
      title: 'text-2xl sm:text-3xl',
      subtitle: 'text-[11px] sm:text-[12px] tracking-[0.26em] mt-0.5'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.default;

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 ${className}`}>
      {shouldRenderImage && (
        <img 
          src={logoSrc} 
          alt={`${brandName} ${brandSubtitle}`.trim() || 'Avora Library'} 
          className={`${currentSize.icon} object-contain transition-transform group-hover:scale-105 shrink-0`} 
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/icon-192.png';
          }}
        />
      )}
      {shouldRenderText && (
        <div className="flex flex-col select-none leading-none justify-center">
          {brandName && (
            <span className={`font-brand font-black ${currentSize.title} tracking-tight text-slate-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors`}>
              {brandName}
            </span>
          )}
          {brandSubtitle && (
            <span className={`font-brand font-extrabold uppercase ${currentSize.subtitle} text-brand-600 dark:text-brand-400`}>
              {brandSubtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

