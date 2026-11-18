'use client';

import Link from 'next/link';
import { BookOpen, GraduationCap, Download, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearch } from '@/context/SearchContext';
import { usePWA } from '@/context/PWAContext';

export default function Navbar() {
  const { openSearch } = useSearch();
  const { isInstalled, promptInstall } = usePWA();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      role="banner"
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-sm shadow-indigo-100/50 border-b border-indigo-100/80'
          : 'bg-white/80 backdrop-blur-md border-b border-transparent'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 h-14 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none flex-shrink-0"
          aria-label="SSLC Reader Home"
        >
          <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-300/40 transition-all duration-300 group-hover:scale-105">
            <BookOpen className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-white" strokeWidth={2.5} size={18} aria-hidden="true" />
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="leading-none">
            <span className="text-sm sm:text-base font-black tracking-tight text-slate-900">SSLC</span>
            <span className="text-sm sm:text-base font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"> Reader</span>
          </div>
        </Link>

        {/* Search trigger button (Desktop) */}
        <div className="flex-1 max-w-sm mx-4 hidden md:block">
          <button
            type="button"
            onClick={openSearch}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/80 px-3.5 py-1.5 text-xs text-slate-400 transition-all hover:bg-white hover:border-indigo-300 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
            aria-label="Search all study materials (shortcut: Ctrl+K or /)"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" />
              <span>Search subjects & materials…</span>
            </span>
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile search icon button */}
          <button
            type="button"
            onClick={openSearch}
            className="flex md:hidden h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-600"
            aria-label="Search study materials"
          >
            <Search className="h-4 w-4 text-indigo-600" aria-hidden="true" />
          </button>

          {/* Install App button (ALWAYS visible if not installed!) */}
          {!isInstalled && (
            <button
              type="button"
              onClick={promptInstall}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:shadow-md hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-600"
              aria-label="Install mobile app version"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden xs:inline sm:inline">Install App</span>
              <span className="xs:hidden sm:hidden">Install</span>
            </button>
          )}

          {/* SSLC Hub Link */}
          <Link
            href="/portal"
            className="flex items-center gap-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 border border-indigo-200 transition-colors text-xs font-semibold text-indigo-700 active:scale-95"
            aria-label="SSLC Resource Hub and Portal"
          >
            <GraduationCap className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
            <span className="hidden sm:inline">SSLC Hub</span>
            <span className="rounded-full bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.2">New</span>
          </Link>
        </div>
      </div>
    </header>
  );
}