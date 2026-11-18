'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, BookOpen, FileText, ArrowRight, CornerDownLeft, Loader2 } from 'lucide-react';
import { Category, Document } from '@/types';
import { getCategories, getDocuments } from '@/lib/firestore';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, startTransition] = useTransition();

  // Load data when modal opens
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
      return;
    }

    let active = true;
    setLoading(true);

    Promise.all([getCategories(), getDocuments()])
      .then(([cats, docs]) => {
        if (!active) return;
        setCategories(cats);
        setDocuments(docs);
      })
      .catch((err) => {
        console.error('Failed to load search index:', err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // Auto-focus input after render
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Map category ID to Name
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  // Filter items
  const cleanQuery = query.trim().toLowerCase();

  const matchingCategories = cleanQuery
    ? categories.filter((c) => c.name.toLowerCase().includes(cleanQuery))
    : [];

  const matchingDocuments = cleanQuery
    ? documents.filter(
        (d) =>
          d.title.toLowerCase().includes(cleanQuery) ||
          (categoryMap.get(d.categoryId) || '').toLowerCase().includes(cleanQuery)
      )
    : [];

  // Combined results for keyboard navigation
  const results = [
    ...matchingCategories.map((c) => ({ type: 'category' as const, data: c })),
    ...matchingDocuments.map((d) => ({ type: 'document' as const, data: d })),
  ];

  // Handle keyboard events (Escape, Arrow Up/Down, Enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          navigateToResult(selected);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Keep selected index in bounds when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [cleanQuery]);

  const navigateToResult = (result: (typeof results)[0]) => {
    onClose();
    startTransition(() => {
      if (result.type === 'category') {
        router.push(`/category/${result.data.id}`);
      } else {
        router.push(`/read/${result.data.id}`);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search study materials"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 sm:pt-20"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 focus-visible:outline-none">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-100 px-4 py-3 sm:px-5">
          <Search className="h-5 w-5 text-indigo-500 flex-shrink-0" aria-hidden="true" />
          <label htmlFor="global-search-input" className="sr-only">
            Search all subjects, notes, and PDF papers
          </label>
          <input
            id="global-search-input"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, question papers, notes..."
            className="w-full bg-transparent px-3 py-1.5 text-base text-slate-900 placeholder:text-slate-400 outline-none"
            autoComplete="off"
            spellCheck="false"
          />

          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-hidden="true" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition"
              aria-label="Clear search input"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
              ESC
            </kbd>
          )}
        </div>

        {/* Live Region for Screen Readers */}
        <div aria-live="polite" className="sr-only">
          {cleanQuery &&
            `${results.length} result${results.length === 1 ? '' : 's'} available.`}
        </div>

        {/* Results / Suggestions Container */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto p-2 sm:p-3 space-y-4"
          tabIndex={-1}
        >
          {/* When query is empty: quick suggestion chips */}
          {!cleanQuery && (
            <div className="p-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Popular Subjects
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 8).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push(`/category/${cat.id}`);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition"
                  >
                    <BookOpen className="h-3 w-3 text-indigo-500" />
                    {cat.name}
                  </button>
                ))}
              </div>

              {documents.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Recent Documents ({documents.length} available)
                  </p>
                  <div className="space-y-1">
                    {documents.slice(0, 4).map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => {
                          onClose();
                          router.push(`/read/${doc.id}`);
                        }}
                        className="flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 transition group"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <FileText className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 flex-shrink-0" />
                          <span className="truncate">{doc.title}</span>
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results: Subject Matches */}
          {cleanQuery && matchingCategories.length > 0 && (
            <div>
              <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Subjects ({matchingCategories.length})
              </p>
              <div className="space-y-1">
                {matchingCategories.map((cat, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={cat.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => navigateToResult({ type: 'category', data: cat })}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 flex-shrink-0">
                          <BookOpen className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className="text-xs text-indigo-600 flex items-center gap-1 flex-shrink-0 font-medium">
                        View Subject <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results: Document Matches */}
          {cleanQuery && matchingDocuments.length > 0 && (
            <div>
              <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Documents ({matchingDocuments.length})
              </p>
              <div className="space-y-1">
                {matchingDocuments.map((doc, idx) => {
                  const itemIndex = matchingCategories.length + idx;
                  const isSelected = selectedIndex === itemIndex;
                  const catName = categoryMap.get(doc.categoryId);
                  return (
                    <div
                      key={doc.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => navigateToResult({ type: 'document', data: doc })}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 flex-shrink-0">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm">{doc.title}</p>
                          {catName && (
                            <p className="text-[10px] text-slate-400 font-normal truncate">
                              {catName}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                          {doc.type === 'drive_link' ? 'Drive' : 'PDF'}
                        </span>
                        <CornerDownLeft className="h-3 w-3 text-slate-400 hidden sm:inline" />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state when searching but no matches */}
          {cleanQuery && results.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm font-semibold text-slate-700">No matching materials found</p>
              <p className="mt-1 text-xs text-slate-400">
                Try searching with a different subject or document keyword.
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="hidden sm:flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border bg-white px-1 py-0.5 font-sans">↑</kbd>{' '}
              <kbd className="rounded border bg-white px-1 py-0.5 font-sans">↓</kbd> Navigate
            </span>
            <span>
              <kbd className="rounded border bg-white px-1 py-0.5 font-sans">↵</kbd> Select
            </span>
          </div>
          <span>
            <kbd className="rounded border bg-white px-1 py-0.5 font-sans">ESC</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
}
