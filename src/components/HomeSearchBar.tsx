'use client';

import { Search, Download } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';
import { usePWA } from '@/context/PWAContext';

export default function HomeSearchBar() {
  const { openSearch } = useSearch();
  const { isInstalled, promptInstall } = usePWA();

  return (
    <div className="mt-5 max-w-md space-y-3">
      {/* Search Input Button */}
      <button
        type="button"
        onClick={openSearch}
        className="group flex w-full items-center justify-between rounded-2xl border border-white/20 bg-white/10 p-2.5 sm:p-3 text-left backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/30 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        aria-label="Search all subjects and study materials"
      >
        <span className="flex items-center gap-2.5 text-sm font-medium text-indigo-100 group-hover:text-white transition-colors">
          <Search className="h-4 w-4 text-yellow-300" aria-hidden="true" />
          <span>Search any subject, chapter, or question paper…</span>
        </span>
        <kbd className="hidden sm:inline-flex rounded-lg border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-100">
          /
        </kbd>
      </button>

      {/* Mobile App Install Callout (visible on mobile when not in standalone mode) */}
      {!isInstalled && (
        <button
          type="button"
          onClick={promptInstall}
          className="flex sm:hidden w-full items-center justify-between rounded-xl border border-white/25 bg-white/15 px-3 py-2 text-left backdrop-blur-sm transition active:scale-[0.98] shadow-sm"
          aria-label="Install mobile app"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm flex-shrink-0">
              <Download className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">Install Mobile App</p>
              <p className="text-[10px] text-indigo-100 leading-tight">Fast 1-tap reading on your phone</p>
            </div>
          </div>
          <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-extrabold text-indigo-700 shadow-sm flex-shrink-0">
            Install
          </span>
        </button>
      )}
    </div>
  );
}