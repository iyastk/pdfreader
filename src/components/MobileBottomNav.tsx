'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Search, Home } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/#subjects', label: 'Subjects', icon: BookOpen },
  { href: '/#search', label: 'Search', icon: Search },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Only show on student-facing pages, not admin
  if (pathname.startsWith('/admin')) return null;

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'none', // shown via CSS media query
        height: '64px',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid #e0e7ff',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href.replace('/#', '/'));
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                padding: '8px 4px',
                color: isActive ? '#4f46e5' : '#9ca3af',
                textDecoration: 'none',
                transition: 'color 0.2s',
                minHeight: '44px',
              }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span style={{ fontSize: '10px', fontWeight: isActive ? '600' : '400', letterSpacing: '0.02em' }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
