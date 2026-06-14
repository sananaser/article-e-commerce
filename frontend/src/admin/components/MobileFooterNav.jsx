import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutGrid, 
  Tag, 
  Package, 
  ClipboardList, 
  Users 
} from 'lucide-react';

const DEFAULT_NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', icon: <LayoutGrid size={20} />, end: true },
  { label: 'Categories', to: '/admin/categories', icon: <Tag size={20} /> },
  { label: 'Products', to: '/admin/products', icon: <Package size={20} /> },
  { label: 'Orders', to: '/admin/orders', icon: <ClipboardList size={20} /> },
  { label: 'Users', to: '/admin/users', icon: <Users size={20} /> }
];

export default function MobileFooterNav({ items = DEFAULT_NAV_ITEMS }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--sidebar-bg)]/90 backdrop-blur-md border-t border-[var(--sidebar-border)] shadow-[0_-4px_20px_rgba(0,0,0,0.4)] pb-[env(safe-area-inset-bottom)]">
      <nav className="flex items-center justify-around h-16 px-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `
              flex flex-col items-center justify-center flex-1 h-full py-2 px-1
              relative select-none transition-all duration-300
            `}
          >
            {({ isActive }) => (
              <>
                {/* Active indicator bar at the top */}
                <span 
                  className={`absolute top-0 w-10 h-1 bg-[var(--sidebar-active-border)] rounded-b-full transition-all duration-300 transform origin-top ${
                    isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                  }`} 
                />
                
                {/* Icon wrapper with glow & scale transitions */}
                <div 
                  className={`p-1.5 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] scale-110 shadow-[0_0_12px_rgba(139,92,246,0.2)]' 
                      : 'text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-h)] hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                </div>
                
                {/* Navigation text label */}
                <span 
                  className={`text-[10px] mt-1 font-semibold tracking-wide transition-colors duration-300 ${
                    isActive ? 'text-[var(--sidebar-active-text)]' : 'text-[var(--sidebar-text)]'
                  }`}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
