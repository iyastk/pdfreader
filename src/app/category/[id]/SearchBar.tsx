'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Document } from '@/types';
import DocumentCard from '@/components/DocumentCard';
import EmptyState from '@/components/EmptyState';

interface SearchBarProps {
  documents: Document[];
}

type FilterType = 'all' | 'firebase_upload' | 'drive_link';

export default function SearchBar({ documents }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: '/' focuses search, 'Escape' clears
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        if (query) {
          setQuery('');
        } else {
          inputRef.current?.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [query]);

  const filtered = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    return documents.filter((doc) => {
      const matchesQuery = !cleanQuery || doc.title.toLowerCase().includes(cleanQuery);
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      return matchesQuery && matchesType;
    });
  }, [documents, query, typeFilter]);

  const pdfCount = useMemo(
    () => documents.filter((d) => d.type === 'firebase_upload').length,
    [documents]
  );
  const driveCount = useMemo(
    () => documents.filter((d) => d.type === 'drive_link').length,
    [documents]
  );

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-3">
        <label htmlFor="subject-docs-search" className="sr-only">
          Search documents in this subject
        </label>
        <Search
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          id="subject-docs-search"
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documents… (Press / to focus)"
          aria-label="Search documents in this subject"
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 hover:border-slate-300"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            aria-label="Clear search input"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter chips (if both types exist) */}
      {pdfCount > 0 && driveCount > 0 && (
        <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Filter documents by format">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" aria-hidden="true" />
            <span>Format:</span>
          </span>
          <button
            type="button"
            role="tab"
            aria-selected={typeFilter === 'all'}
            onClick={() => setTypeFilter('all')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              typeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All ({documents.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={typeFilter === 'firebase_upload'}
            onClick={() => setTypeFilter('firebase_upload')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              typeFilter === 'firebase_upload'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            PDF Files ({pdfCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={typeFilter === 'drive_link'}
            onClick={() => setTypeFilter('drive_link')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              typeFilter === 'drive_link'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Google Drive ({driveCount})
          </button>
        </div>
      )}

      {/* Live announcement of result count for Screen Readers */}
      <div aria-live="polite" className="sr-only">
        {query || typeFilter !== 'all'
          ? `${filtered.length} document${filtered.length === 1 ? '' : 's'} found.`
          : ''}
      </div>

      {/* Result count text */}
      {(query || typeFilter !== 'all') && (
        <p className="mb-3 text-xs text-slate-500 font-medium">
          {filtered.length === 0
            ? 'No results found'
            : `${filtered.length} document${filtered.length !== 1 ? 's' : ''} found`}
          {query ? ` for "${query}"` : ''}
        </p>
      )}

      {/* Results List */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No documents found"
          message={
            query
              ? `No documents match "${query}". Try a different keyword.`
              : 'No documents match the selected format filter.'
          }
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
}