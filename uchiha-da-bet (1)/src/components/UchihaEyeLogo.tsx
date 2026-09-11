import React from 'react';

interface UchihaEyeLogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

export const UchihaEyeLogo: React.FC<UchihaEyeLogoProps> = ({
  size = 40,
  animated = true,
  className = '',
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Glow aura */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-600/30 to-orange-500/20 blur-md" />

      {/* SVG Stylized Sharingan / Ocular Geometry */}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`relative z-10 ${animated ? 'animate-[spin_24s_linear_infinite]' : ''}`}
      >
        <defs>
          <linearGradient id="uchihaRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="60%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <linearGradient id="flameOrange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <filter id="eyeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#ef4444" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Outer dark ring */}
        <circle cx="50" cy="50" r="46" fill="#09090b" stroke="#27272a" strokeWidth="2.5" />

        {/* Iris circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="url(#uchihaRed)"
          stroke="#7f1d1d"
          strokeWidth="1.5"
          filter="url(#eyeGlow)"
        />

        {/* Inner thin orbit line */}
        <circle cx="50" cy="50" r="26" fill="none" stroke="#450a0a" strokeWidth="1.5" strokeDasharray="3 2" />

        {/* Center pupil */}
        <circle cx="50" cy="50" r="10" fill="#09090b" stroke="#ef4444" strokeWidth="1" />
        <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.8" />

        {/* Stylized geometric marks / Tomoe marks (Original vector geometry) */}
        {/* Mark 1 (Top) */}
        <g transform="translate(50, 24) rotate(0)">
          <circle cx="0" cy="0" r="4.5" fill="#09090b" />
          <path d="M 0,-4.5 C 5,-2 7,4 3,8 C 0,5 -3,0 0,-4.5 Z" fill="#09090b" />
        </g>

        {/* Mark 2 (Bottom Right 120 deg) */}
        <g transform="translate(50, 50) rotate(120) translate(0, -26)">
          <circle cx="0" cy="0" r="4.5" fill="#09090b" />
          <path d="M 0,-4.5 C 5,-2 7,4 3,8 C 0,5 -3,0 0,-4.5 Z" fill="#09090b" />
        </g>

        {/* Mark 3 (Bottom Left 240 deg) */}
        <g transform="translate(50, 50) rotate(240) translate(0, -26)">
          <circle cx="0" cy="0" r="4.5" fill="#09090b" />
          <path d="M 0,-4.5 C 5,-2 7,4 3,8 C 0,5 -3,0 0,-4.5 Z" fill="#09090b" />
        </g>
      </svg>
    </div>
  );
};
