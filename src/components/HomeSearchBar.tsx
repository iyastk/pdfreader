'use client';

import { Search } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';

export default function HomeSearchBar() {
  const { openSearch } = useSearch();

  return (
    <button
      type="button"
      onClick={openSearch}
      className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 sm:px-5 sm:py-3.5 text-left shadow-2xs transition-all hover:border-indigo-400 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none active:scale-[0.99]"
      aria-label="Search all subjects and study materials"
    >
      <span className="flex items-center gap-3 min-w-0 flex-1 text-xs sm:text-sm font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
        <Search className="h-4.5 w-4.5 text-indigo-500 flex-shrink-0" aria-hidden="true" />
        <span className="truncate">Search subjects, question papers, notes…</span>
      </span>
      <kbd className="hidden sm:inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-400 flex-shrink-0">
        Ctrl K
      </kbd>
    </button>
  );
}
