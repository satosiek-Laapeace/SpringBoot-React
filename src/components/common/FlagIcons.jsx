import React from 'react';

export const FlagEN = ({ className = 'w-5 h-4' }) => (
  <svg className={`rounded-sm shadow-xs ${className}`} viewBox="0 0 60 30" fill="none" aria-hidden="true">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0L60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0L60 30M60 0L0 30" stroke="#C8102E" strokeWidth="2" />
      <path d="M30 0V30M0 15H60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0V30M0 15H60" stroke="#C8102E" strokeWidth="6" />
  </svg>
);

export const FlagKM = ({ className = 'w-5 h-4' }) => (
  <svg className={`rounded-sm shadow-xs ${className}`} viewBox="0 0 60 40" fill="none" aria-hidden="true">
      {/* Top and Bottom Blue Bands */}
      <rect width="60" height="40" fill="#032ea1" />
      {/* Middle Red Band */}
      <rect y="10" width="60" height="20" fill="#e00025" />
      {/* White Angkor Wat Silhouette */}
      <path
        d="M20 25 H40 V24 L38 24 V21 L36 21 V20 L35 20 V18 L34 18 V15 L32 15 V14 L30 11 L28 14 L26 15 V18 L25 18 V20 L24 20 V21 L22 21 V24 L20 24 Z"
        fill="#ffffff"
      />
      <rect x="25" y="22" width="2" height="3" fill="#e00025" />
      <rect x="29" y="20" width="2" height="5" fill="#e00025" />
      <rect x="33" y="22" width="2" height="3" fill="#e00025" />
  </svg>
);
