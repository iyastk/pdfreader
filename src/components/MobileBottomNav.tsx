'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Search } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/',         label: 'Home',     icon: Home },
  { href: '/#subjects', label: 'Subjects', icon: BookOpen },
  { href: '/#search',   label: 'Search',   icon: Search },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <nav
      className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 items-center"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(226,232,240,0.8)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="flex h-16 items-center">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : false;
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-all duration-200"
              style={{ color: isActive ? '#4f46e5' : '#94a3b8' }}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute top-1.5 h-1 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
              )}
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                className="transition-transform duration-200"
                style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)' }}
              />
              <span className="text-[10px] font-semibold tracking-wide leading-none">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
