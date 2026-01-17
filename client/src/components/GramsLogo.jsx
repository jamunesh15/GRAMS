import React from 'react';

export default function GramsLogo({ size = 24, className = '' }) {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="grams_mark" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#138808" />
          <stop offset="1" stopColor="#0f6e06" />
        </linearGradient>
      </defs>

      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#grams_mark)" />
 
      {/* Stylized G mark */}
      <path
        d="M30.5 18.5c-1.4-2.1-3.9-3.5-6.7-3.5-4.3 0-7.8 3.6-7.8 8.1s3.5 8.1 7.8 8.1c3.5 0 6.4-2.4 7.4-5.8h-7.4v-3.2h11.2c.2.8.3 1.6.3 2.5 0 6.6-4.6 11.5-11.5 11.5-6.4 0-11.5-5.2-11.5-11.6S17.9 11 24.3 11c4.3 0 8 2.1 10 5.3l-3.8 2.2z"
        fill="#ffffff"
        fillOpacity="0.96"
      />

      {/* Subtle highlight */}
      <path
        d="M13 10.5c4-3.2 9.7-3.9 14.4-1.9"
        stroke="#ffffff"
        strokeOpacity="0.25"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
