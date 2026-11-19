'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Search, Download, GraduationCap } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';
import { usePWA } from '@/context/PWAContext';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { openSearch } = useSearch();
  const { isInstalled, promptInstall } = usePWA();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header
      role="banner"
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-xs border-b border-slate-200/80'
          : 'bg-white border-b border-slate-100'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 sm:px-10 h-14 sm:h-16">
        {/* Logo with generous left padding */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none flex-shrink-0"
          aria-label="SSLC Reader Home"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-xs shadow-indigo-300 transition-transform group-hover:scale-105">
            <BookOpen className="h-4.5 w-4.5 text-white" strokeWidth={2.5} size={18} aria-hidden="true" />
          </div>
          <div className="leading-none">
            <span className="text-base font-black tracking-tight text-slate-900">SSLC</span>
            <span className="text-base font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"> Reader</span>
          </div>
        </Link>

        {/* Search trigger button (Desktop: Only shown on subpages or when scrolled to prevent duplicate on Home) */}
        {(!isHome || scrolled) && (
          <div className="flex-1 max-w-md mx-6 hidden md:block">
            <button
              type="button"
              onClick={openSearch}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/80 px-4 py-2 text-xs text-slate-400 transition-all hover:bg-white hover:border-indigo-300 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none shadow-2xs"
              aria-label="Search all study materials"
            >
              <span className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" />
                <span>Search subjects & materials…</span>
              </span>
              <kbd className="rounded-lg border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                Ctrl K
              </kbd>
            </button>
          </div>
        )}

        {/* Right Actions: Spacious buttons with ample X padding */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile search icon button */}
          <button
            type="button"
            onClick={openSearch}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-600 transition hover:bg-slate-100 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-600"
            aria-label="Search study materials"
          >
            <Search className="h-4 w-4 text-indigo-600" aria-hidden="true" />
          </button>

          {/* Desktop-only Install App button with generous X padding */}
          {!isInstalled && (
            <button
              type="button"
              onClick={promptInstall}
              className="hidden md:flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:shadow-md hover:scale-102 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-600"
              aria-label="Install mobile app version"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Install App</span>
            </button>
          )}

          {/* Desktop-only SSLC Hub Link with generous X padding */}
          <Link
            href="/portal"
            className="hidden md:flex items-center gap-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 px-5 py-2 border border-indigo-200/80 transition-colors text-xs font-bold text-indigo-700 active:scale-95 shadow-2xs"
            aria-label="SSLC Resource Hub and Portal"
          >
            <GraduationCap className="h-4 w-4 text-indigo-600" aria-hidden="true" />
            <span>SSLC Hub</span>
            <span className="rounded-md bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 ml-0.5">New</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
