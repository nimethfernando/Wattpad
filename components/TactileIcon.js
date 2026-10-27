'use client';
import React from 'react';

/**
 * TactileIcon Component inspired by clawbrick.com
 * Features a tactile, skeuomorphic/neumorphic debossed dark squircle tile
 * with glowing neon duotone linework and optional 3-dot status indicators.
 */
export default function TactileIcon({
  icon: Icon,
  size = 'md',
  color = 'coral',
  hasDots = false,
  glow = true,
  className = '',
  style = {},
  onClick = null
}) {
  // Size presets
  const sizeStyles = {
    xs: {
      container: 'w-8 h-8 rounded-xl',
      icon: 'w-4 h-4',
      dot: 'w-1 h-1'
    },
    sm: {
      container: 'w-10 h-10 rounded-2xl',
      icon: 'w-5 h-5',
      dot: 'w-1.5 h-1.5'
    },
    md: {
      container: 'w-13 h-13 sm:w-14 sm:h-14 rounded-2xl p-3',
      icon: 'w-6 h-6',
      dot: 'w-1.5 h-1.5'
    },
    lg: {
      container: 'w-16 h-16 sm:w-18 sm:h-18 rounded-3xl p-4',
      icon: 'w-8 h-8',
      dot: 'w-2 h-2'
    },
    xl: {
      container: 'w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-5',
      icon: 'w-10 h-10',
      dot: 'w-2.5 h-2.5'
    }
  };

  // Color & Glow presets
  const colorMap = {
    coral: {
      stroke: 'text-[#ff7865]',
      glow: 'drop-shadow-[0_2px_8px_rgba(255,120,101,0.55)]',
      borderGlow: 'hover:border-[#ff7865]/40 hover:shadow-[0_0_20px_rgba(255,120,101,0.25)]',
      dotBg: 'bg-[#ff7865]'
    },
    amber: {
      stroke: 'text-[#fb923c]',
      glow: 'drop-shadow-[0_2px_8px_rgba(251,146,60,0.55)]',
      borderGlow: 'hover:border-[#fb923c]/40 hover:shadow-[0_0_20px_rgba(251,146,60,0.25)]',
      dotBg: 'bg-[#fb923c]'
    },
    purple: {
      stroke: 'text-[#a78bfa]',
      glow: 'drop-shadow-[0_2px_8px_rgba(167,139,250,0.55)]',
      borderGlow: 'hover:border-[#a78bfa]/40 hover:shadow-[0_0_20px_rgba(167,139,250,0.25)]',
      dotBg: 'bg-[#a78bfa]'
    },
    emerald: {
      stroke: 'text-[#34d399]',
      glow: 'drop-shadow-[0_2px_8px_rgba(52,211,153,0.55)]',
      borderGlow: 'hover:border-[#34d399]/40 hover:shadow-[0_0_20px_rgba(52,211,153,0.25)]',
      dotBg: 'bg-[#34d399]'
    },
    cyan: {
      stroke: 'text-[#38bdf8]',
      glow: 'drop-shadow-[0_2px_8px_rgba(56,189,248,0.55)]',
      borderGlow: 'hover:border-[#38bdf8]/40 hover:shadow-[0_0_20px_rgba(56,189,248,0.25)]',
      dotBg: 'bg-[#38bdf8]'
    }
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;
  const currentColor = colorMap[color] || colorMap.coral;

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      style={style}
      className={`relative inline-flex flex-col items-center justify-center shrink-0 transition-all duration-200 select-none ${
        currentSize.container
      } ${
        onClick ? 'cursor-pointer active:scale-95' : ''
      } ${currentColor.borderGlow} ${className}`}
    >
      {/* 1. Neumorphic Tile Foundation with Beveled Dark Rim & Sunken Inset */}
      <div 
        className="absolute inset-0 rounded-[inherit] pointer-events-none transition-all duration-200"
        style={{
          background: 'linear-gradient(180deg, #21252d 0%, #13151a 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: `
            inset 0 2px 4px rgba(0, 0, 0, 0.8),
            inset 0 -1px 2px rgba(255, 255, 255, 0.06),
            0 4px 12px rgba(0, 0, 0, 0.45)
          `
        }}
      />

      {/* 2. Optional 3-Dot Status Indicators (From ClawBrick's Genevieve Hero Card) */}
      {hasDots && (
        <div className="relative z-10 flex items-center gap-1.5 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] shadow-[0_0_6px_#f97316]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] shadow-[0_0_6px_#a855f7]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e]" />
        </div>
      )}

      {/* 3. The Central Glowing Icon */}
      {Icon && (
        <div className={`relative z-10 flex items-center justify-center ${currentColor.stroke} ${glow ? currentColor.glow : ''}`}>
          <Icon className={`${currentSize.icon} stroke-[1.8]`} />
        </div>
      )}
    </Component>
  );
}

