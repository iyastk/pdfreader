'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Filter, CheckCircle2, FileText, Check } from 'lucide-react';
import { Document } from '@/types';
import DocumentCard from '@/components/DocumentCard';
import EmptyState from '@/components/EmptyState';

interface SearchBarProps {
  documents: Document[];
}

type StudyFilter = 'all' | 'qp' | 'key' | 'em' | 'mm' | 'model';

export default function SearchBar({ documents }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<StudyFilter>('all');
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

  // Counts for filters
  const counts = useMemo(() => {
    let qp = 0;
    let key = 0;
    let em = 0;
    let mm = 0;
    let model = 0;

    documents.forEach((d) => {
      const titleLower = d.title.toLowerCase();
      const isKey = titleLower.includes('answer key') || titleLower.includes('answer');
      if (isKey) key++;
      else if (titleLower.includes('question') || titleLower.includes('exam')) qp++;

      if (d.title.toUpperCase().includes('[EM]') || d.title.toUpperCase().includes('(EM)') || d.title.toUpperCase().includes('ENGLISH MEDIUM')) em++;
      if (d.title.toUpperCase().includes('[MM]') || d.title.toUpperCase().includes('(MM)') || d.title.toUpperCase().includes('MALAYALAM MEDIUM')) mm++;
      if (titleLower.includes('model') || titleLower.includes('samagra') || titleLower.includes('set')) model++;
    });

    return { all: documents.length, qp, key, em, mm, model };
  }, [documents]);

  const filtered = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    return documents.filter((doc) => {
      const titleLower = doc.title.toLowerCase();

      // Filter logic
      if (filter === 'key' && !titleLower.includes('answer')) return false;
      if (filter === 'qp' && !titleLower.includes('question') && !titleLower.includes('exam')) return false;
      if (filter === 'em' && !doc.title.toUpperCase().includes('EM') && !doc.title.toUpperCase().includes('ENGLISH MEDIUM')) return false;
      if (filter === 'mm' && !doc.title.toUpperCase().includes('MM') && !doc.title.toUpperCase().includes('MALAYALAM MEDIUM')) return false;
      if (filter === 'model' && !titleLower.includes('model') && !titleLower.includes('samagra') && !titleLower.includes('set')) return false;

      // Search query logic
      if (cleanQuery && !titleLower.includes(cleanQuery)) return false;

      return true;
    });
  }, [documents, query, filter]);

  return (
    <div>
      {/* ── Search Bar Input ───────────────────────── */}
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
          placeholder="Search question papers, answer keys, chapters…"
          aria-label="Search documents in this subject"
          className="w-full rounded-2xl border border-slate-200/90 bg-white py-3 pl-10 pr-10 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 hover:border-slate-300"
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

      {/* ── Touch-Friendly Study Filter Chips ─────── */}
      <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none" role="tablist" aria-label="Filter documents">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
            filter === 'all'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All ({counts.all})
        </button>

        {counts.qp > 0 && (
          <button
            type="button"
            onClick={() => setFilter('qp')}
            className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
              filter === 'qp'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Question Papers ({counts.qp})
          </button>
        )}

        {counts.key > 0 && (
          <button
            type="button"
            onClick={() => setFilter('key')}
            className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
              filter === 'key'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                : 'bg-white border border-emerald-200/80 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Answer Keys ({counts.key})
          </button>
        )}

        {counts.em > 0 && (
          <button
            type="button"
            onClick={() => setFilter('em')}
            className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
              filter === 'em'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            English Medium ({counts.em})
          </button>
        )}

        {counts.mm > 0 && (
          <button
            type="button"
            onClick={() => setFilter('mm')}
            className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
              filter === 'mm'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-50'
            }`}
          >
            Malayalam Medium ({counts.mm})
          </button>
        )}

        {counts.model > 0 && (
          <button
            type="button"
            onClick={() => setFilter('model')}
            className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
              filter === 'model'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-white border border-violet-200 text-violet-700 hover:bg-violet-50'
            }`}
          >
            Model Exams ({counts.model})
          </button>
        )}
      </div>

      {/* ── Document List ──────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No matching materials"
          message={
            query
              ? `No documents matched "${query}". Try clearing your search.`
              : 'No documents match the selected filter.'
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
