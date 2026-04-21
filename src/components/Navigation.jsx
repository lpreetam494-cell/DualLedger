import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ReceiptText, Users, TrendingUp, User, Globe2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { path: '/', label: 'HOME', icon: Home },
  { path: '/transactions', label: 'TXNS', icon: ReceiptText },
  { path: '/split', label: 'SPLIT', icon: Users },
  { path: '/social', label: 'SOCIAL', icon: Globe2 },
  { path: '/insights', label: 'INSIGHTS', icon: TrendingUp },
  { path: '/profile', label: 'PROFILE', icon: User },
];

export default function Navigation() {
  return (
    <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 flex justify-between items-center px-6 py-3 pb-8 z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 min-w-[50px] transition-colors",
              isActive ? "text-primary" : "text-gray-500 hover:text-gray-900"
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "fill-primary/10" : ""} />
              <span className="text-[10px] font-semibold tracking-wide uppercase">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}
