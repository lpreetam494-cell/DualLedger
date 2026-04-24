import React from 'react';

export default function Logo({ className = "w-12 h-12", color = "currentColor", variant = "full" }) {
  if (variant === "text") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <LogoIcon className="w-8 h-8" color={color} />
        <span className="font-bold text-xl tracking-tight">DualLedger</span>
      </div>
    );
  }

  return <LogoIcon className={className} color={color} />;
}

function LogoIcon({ className, color }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      role="img"
      aria-labelledby="logoTitle"
    >
      <title id="logoTitle">DualLedger Logo</title>
      {/* Subtle background container */}
      <rect width="100" height="100" rx="24" fill={color} fillOpacity="0.08" />
      
      {/* Two parallel ledger columns representing 'Dual' */}
      {/* Column 1 - Primary Action */}
      <rect 
        x="32" 
        y="28" 
        width="12" 
        height="44" 
        rx="4" 
        fill={color} 
      />
      
      {/* Column 2 - Secondary Action / Balance */}
      <rect 
        x="56" 
        y="38" 
        width="12" 
        height="34" 
        rx="4" 
        fill={color} 
        fillOpacity="0.6"
      />
      
      {/* Minimalist curve forming a subtle 'D' shape */}
      <path 
        d="M44 32C58 32 68 38 68 50C68 62 58 68 44 68" 
        stroke={color} 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeOpacity="0.9"
      />
    </svg>
  );
}
