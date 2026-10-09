'use client';

export default function BrandLogo({ size = 'default', showText = true, className = '' }) {
  // Size mapping for icon and typography
  const sizeMap = {
    sm: {
      icon: 'h-7 w-auto',
      title: 'text-lg',
      subtitle: 'text-[8.5px] tracking-[0.22em] mt-0.5'
    },
    default: {
      icon: 'h-8 sm:h-9 md:h-10 w-auto',
      title: 'text-xl sm:text-2xl',
      subtitle: 'text-[9.5px] sm:text-[10px] tracking-[0.24em] mt-0.5'
    },
    lg: {
      icon: 'h-10 sm:h-12 w-auto',
      title: 'text-2xl sm:text-3xl',
      subtitle: 'text-[11px] sm:text-[12px] tracking-[0.26em] mt-0.5'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.default;

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 ${className}`}>
      <img 
        src="/icon-192.png" 
        alt="Avora Library" 
        className={`${currentSize.icon} object-contain transition-transform group-hover:scale-105 shrink-0`} 
      />
      {showText && (
        <div className="flex flex-col select-none leading-none justify-center">
          <span className={`font-brand font-black ${currentSize.title} tracking-tight text-slate-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors`}>
            Avora
          </span>
          <span className={`font-brand font-extrabold uppercase ${currentSize.subtitle} text-brand-600 dark:text-brand-400`}>
            Library
          </span>
        </div>
      )}
    </div>
  );
}

