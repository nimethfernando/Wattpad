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

  // Size mapping for icon and typography with support for customizable logoSize ('compact' | 'default' | 'large' | 'xlarge')
  const logoScale = branding?.logoSize || 'default';

  const getFullImageClass = (baseSize) => {
    if (logoScale === 'xlarge') {
      if (baseSize === 'sm') return 'h-9 sm:h-10 max-w-[210px] w-auto';
      if (baseSize === 'lg') return 'h-16 sm:h-18 md:h-20 lg:h-22 max-w-[360px] sm:max-w-[440px] w-auto';
      return 'h-12 sm:h-13 md:h-14 lg:h-15 max-w-[260px] sm:max-w-[320px] md:max-w-[360px] w-auto';
    }
    if (logoScale === 'large') {
      if (baseSize === 'sm') return 'h-8.5 sm:h-9.5 max-w-[200px] w-auto';
      if (baseSize === 'lg') return 'h-14 sm:h-16 md:h-18 max-w-[320px] sm:max-w-[400px] w-auto';
      return 'h-11 sm:h-12 md:h-13 max-w-[250px] sm:max-w-[300px] md:max-w-[340px] w-auto';
    }
    if (logoScale === 'compact') {
      if (baseSize === 'sm') return 'h-7 max-w-[160px] w-auto';
      if (baseSize === 'lg') return 'h-10 sm:h-12 max-w-[260px] w-auto';
      return 'h-8 sm:h-9 max-w-[200px] w-auto';
    }
    // Default: Generously sized, bold, and readable on all screens
    if (baseSize === 'sm') return 'h-8 sm:h-9 max-w-[190px] w-auto';
    if (baseSize === 'lg') return 'h-12 sm:h-14 md:h-16 lg:h-18 max-w-[280px] sm:max-w-[360px] md:max-w-[420px] w-auto';
    return 'h-10 sm:h-11 md:h-12 max-w-[230px] sm:max-w-[280px] md:max-w-[320px] w-auto';
  };

  const sizeMap = {
    sm: {
      icon: effectiveMode === 'full_image'
        ? getFullImageClass('sm')
        : 'h-8 w-auto',
      title: 'text-lg sm:text-xl',
      subtitle: 'text-[9px] tracking-[0.22em] mt-0.5'
    },
    default: {
      icon: effectiveMode === 'full_image'
        ? getFullImageClass('default')
        : 'h-9 sm:h-10 md:h-11 w-auto',
      title: 'text-xl sm:text-2xl md:text-3xl',
      subtitle: 'text-[10px] sm:text-[11px] tracking-[0.24em] mt-0.5'
    },
    lg: {
      icon: effectiveMode === 'full_image'
        ? getFullImageClass('lg')
        : 'h-12 sm:h-14 md:h-16 w-auto',
      title: 'text-2xl sm:text-3xl md:text-4xl',
      subtitle: 'text-[12px] sm:text-[13px] tracking-[0.26em] mt-0.5'
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

