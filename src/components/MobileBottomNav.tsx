'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Search, Download, CheckCircle2, GraduationCap } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';
import { usePWA } from '@/context/PWAContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { openSearch } = useSearch();
  const { isInstalled, promptInstall } = usePWA();

  // Hide on admin routes and while reading a document to maximize reading viewport
  if (pathname.startsWith('/admin') || pathname.startsWith('/read')) {
    return null;
  }

  const isHomeActive = pathname === '/';
  const isCategoryActive = pathname.startsWith('/category');
  const isHubActive = pathname.startsWith('/portal');

  return (
    <nav
      role="navigation"
      aria-label="Mobile Bottom Navigation"
      className="mobile-bottom-nav fixed bottom-0 inset-x-0 z-50 w-full"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: '0 -4px 20px rgba(79, 70, 229, 0.06)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)',
      }}
    >
      <div
        className="mx-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          width: '100%',
          maxWidth: '520px',
          height: '56px',
          alignItems: 'center',
        }}
      >
        {/* 1. Home */}
        <Link
          href="/"
          className="relative flex flex-col items-center justify-center h-full w-full py-1 transition-all active:scale-95 select-none"
          style={{ color: isHomeActive && !isCategoryActive && !isHubActive ? '#4f46e5' : '#64748b' }}
          aria-label="Home"
        >
          {isHomeActive && !isCategoryActive && !isHubActive && (
            <span
              className="absolute top-0 h-1 w-8 rounded-full bg-indigo-600 shadow-sm shadow-indigo-300"
              style={{
                background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
              }}
            />
          )}
          <div
            className={`flex items-center justify-center rounded-xl p-1 transition-all ${
              isHomeActive && !isCategoryActive && !isHubActive ? 'bg-indigo-50/80' : ''
            }`}
          >
            <Home
              size={20}
              strokeWidth={isHomeActive && !isCategoryActive && !isHubActive ? 2.5 : 1.9}
            />
          </div>
          <span
            className="text-[10.5px] font-bold tracking-tight leading-none mt-0.5"
            style={{
              color: isHomeActive && !isCategoryActive && !isHubActive ? '#4338ca' : '#64748b',
            }}
          >
            Home
          </span>
        </Link>

        {/* 2. Subjects */}
        <Link
          href="/#subjects"
          className="relative flex flex-col items-center justify-center h-full w-full py-1 transition-all active:scale-95 select-none"
          style={{ color: isCategoryActive ? '#4f46e5' : '#64748b' }}
          aria-label="Subjects"
        >
          {isCategoryActive && (
            <span
              className="absolute top-0 h-1 w-8 rounded-full bg-indigo-600 shadow-sm shadow-indigo-300"
              style={{
                background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
              }}
            />
          )}
          <div
            className={`flex items-center justify-center rounded-xl p-1 transition-all ${
              isCategoryActive ? 'bg-indigo-50/80' : ''
            }`}
          >
            <BookOpen
              size={20}
              strokeWidth={isCategoryActive ? 2.5 : 1.9}
            />
          </div>
          <span
            className="text-[10.5px] font-bold tracking-tight leading-none mt-0.5"
            style={{
              color: isCategoryActive ? '#4338ca' : '#64748b',
            }}
          >
            Subjects
          </span>
        </Link>

        {/* 3. SSLC Hub / Portal */}
        <Link
          href="/portal"
          className="relative flex flex-col items-center justify-center h-full w-full py-1 transition-all active:scale-95 select-none"
          style={{ color: isHubActive ? '#4f46e5' : '#64748b' }}
          aria-label="SSLC Resource Hub"
        >
          {isHubActive && (
            <span
              className="absolute top-0 h-1 w-8 rounded-full bg-indigo-600 shadow-sm shadow-indigo-300"
              style={{
                background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
              }}
            />
          )}
          <div
            className={`relative flex items-center justify-center rounded-xl p-1 transition-all ${
              isHubActive ? 'bg-indigo-50/80' : ''
            }`}
          >
            <GraduationCap
              size={21}
              strokeWidth={isHubActive ? 2.5 : 1.9}
            />
            {/* New badge dot */}
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />
          </div>
          <span
            className="text-[10.5px] font-bold tracking-tight leading-none mt-0.5"
            style={{
              color: isHubActive ? '#4338ca' : '#64748b',
            }}
          >
            Hub
          </span>
        </Link>

        {/* 4. Global Search */}
        <button
          type="button"
          onClick={openSearch}
          className="relative flex flex-col items-center justify-center h-full w-full py-1 text-slate-500 hover:text-indigo-600 transition-all active:scale-95 select-none"
          aria-label="Search study materials"
        >
          <div className="flex items-center justify-center rounded-xl p-1">
            <Search size={20} strokeWidth={1.9} />
          </div>
          <span className="text-[10.5px] font-bold tracking-tight leading-none text-slate-500 mt-0.5">
            Search
          </span>
        </button>

        {/* 5. Install App Button */}
        <button
          type="button"
          onClick={promptInstall}
          className="relative flex flex-col items-center justify-center h-full w-full py-1 transition-all active:scale-95 select-none"
          style={{ color: isInstalled ? '#059669' : '#4f46e5' }}
          aria-label={isInstalled ? 'App is installed' : 'Install SSLC Reader App'}
        >
          {isInstalled ? (
            <>
              <div className="flex items-center justify-center rounded-xl p-1 bg-emerald-50/60">
                <CheckCircle2 size={20} strokeWidth={2.2} className="text-emerald-600" />
              </div>
              <span className="text-[10.5px] font-bold tracking-tight leading-none text-emerald-700 mt-0.5">
                Installed
              </span>
            </>
          ) : (
            <>
              <div className="relative flex items-center justify-center rounded-xl p-1 bg-indigo-50/70">
                <Download size={20} strokeWidth={2.2} className="text-indigo-600" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              </div>
              <span className="text-[10.5px] font-bold tracking-tight leading-none text-indigo-700 mt-0.5">
                Install
              </span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
}
