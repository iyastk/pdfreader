'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Document } from '@/types';
import DocumentCard from '@/components/DocumentCard';
import EmptyState from '@/components/EmptyState';

interface SearchBarProps {
  documents: Document[];
}

export default function SearchBar({ documents }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {/* Search input */}
      <div id="search" className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documents…"
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 hover:border-slate-300"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Result count */}
      {query && (
        <p className="mb-3 text-xs text-slate-400 font-medium">
          {filtered.length === 0 ? 'No results' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`} for &ldquo;{query}&rdquo;
        </p>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No results found"
          message={`No documents match "${query}". Try a different keyword.`}
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </>
  );
}
