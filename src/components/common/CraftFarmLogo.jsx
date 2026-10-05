import React from 'react';

export const CraftFarmLogo = ({ size = 'md', showText = true, className = '' }) => {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }[size] || 'w-10 h-10';

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }[size] || 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Logo Avatar */}
      <div className={`${dimensions} rounded-full overflow-hidden border-2 border-straw-500 shadow-sm shrink-0 bg-forest-900 relative flex items-center justify-center`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Background Gradient / Barn Circle */}
          <circle cx="50" cy="50" r="48" fill="#1b4332" />
          
          {/* Barn Roof silhouette */}
          <polygon points="20,45 50,22 80,45" fill="#8B4513" opacity="0.6" />
          <rect x="26" y="45" width="48" height="25" fill="#A0522D" opacity="0.5" />
          
          {/* Green wheat background leaves */}
          <path d="M 15 65 C 10 45, 25 35, 30 50 C 25 60, 20 65, 15 65 Z" fill="#2d6a4f" />
          <path d="M 85 65 C 90 45, 75 35, 70 50 C 75 60, 80 65, 85 65 Z" fill="#2d6a4f" />
          <path d="M 22 75 C 15 55, 35 45, 38 60 Z" fill="#40916c" />
          <path d="M 78 75 C 85 55, 65 45, 62 60 Z" fill="#40916c" />

          {/* Farmer Body - Denim Shirt */}
          <path d="M 25 95 C 25 75, 75 75, 75 95 Z" fill="#2b4c7e" />
          {/* Denim collar / button line */}
          <path d="M 44 78 L 50 88 L 56 78" stroke="#d4a373" strokeWidth="2" fill="none" />
          
          {/* Face */}
          <ellipse cx="50" cy="56" rx="17" ry="19" fill="#fcd5ce" />
          {/* Cheeks */}
          <circle cx="40" cy="60" r="3" fill="#f8ad9d" opacity="0.5" />
          <circle cx="60" cy="60" r="3" fill="#f8ad9d" opacity="0.5" />
          {/* Friendly Smile */}
          <path d="M 43 64 Q 50 71 57 64" stroke="#8b4513" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Round Glasses */}
          <circle cx="42" cy="53" r="6.5" stroke="#333" strokeWidth="2" fill="none" />
          <circle cx="58" cy="53" r="6.5" stroke="#333" strokeWidth="2" fill="none" />
          <line x1="48.5" y1="53" x2="51.5" y2="53" stroke="#333" strokeWidth="2" />
          {/* Eyes behind glasses */}
          <circle cx="42" cy="53" r="2" fill="#222" />
          <circle cx="58" cy="53" r="2" fill="#222" />

          {/* Straw Hat */}
          <path d="M 20 42 Q 50 34 80 42 C 84 43, 82 48, 70 47 Q 50 40 30 47 C 18 48, 16 43, 20 42 Z" fill="#e9c46a" />
          <path d="M 33 42 C 33 24, 67 24, 67 42 Z" fill="#f4a261" />
          {/* Hat Ribbon - Forest Green */}
          <path d="M 33 40 Q 50 36 67 40 L 67 42 Q 50 38 33 42 Z" fill="#1b4332" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-serif font-bold tracking-tight text-forest-900 leading-none dark:text-emerald-100 ${textSizes}`}>
            Craft<span className="text-straw-500">Farm</span>
          </span>
          <span className="text-[10px] font-sans font-semibold tracking-wider text-forest-700 uppercase -mt-0.5 dark:text-emerald-300">
            Fresh Market
          </span>
        </div>
      )}
    </div>
  );
};
