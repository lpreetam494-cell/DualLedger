import React from 'react';
import logoImg from '../assets/logo.png';

export default function Logo({ className = "w-12 h-12", variant = "full" }) {
  if (variant === "text") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img src={logoImg} alt="DualLedger Logo" className="w-8 h-8 object-contain" />
        <span className="font-bold text-xl tracking-tight dark:text-white">DualLedger</span>
      </div>
    );
  }

  return <img src={logoImg} alt="DualLedger Logo" className={`object-contain ${className}`} />;
}
