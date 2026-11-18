'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  ArrowLeft,
  FileText,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';
import { Category, Document } from '@/types';
import { getCategories, getDocuments } from '@/lib/firestore';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getSubjectEmoji(name: string): string {
  const upper = name.toUpperCase();
  if (upper.includes('MATH')) return '📐';
  if (upper.includes('PHYSIC')) return '⚡';
  if (upper.includes('CHEM')) return '🧪';
  if (upper.includes('BIOLOG')) return '🧬';
  if (upper.includes('SOCIAL') || upper.includes('HIST')) return '🏛️';
  if (upper.includes('GEOG')) return '🌍';
  if (upper.includes('ENGL')) return '📖';
  if (upper.includes('HINDI')) return '✍️';
  if (upper.includes('MALAYALAM') || upper.includes('PADAVALI')) return '🌴';
  if (upper.includes('ARABIC')) return '📜';
  if (upper.includes('URDU')) return '✒️';
  if (upper.includes('SANSKRIT')) return '🕉️';
  if (upper.includes('ICT')) return '💻';
  return '📚';
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
    }, 60);

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

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedEl = listRef.current.querySelector('[aria-selected="true"]');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Reset selected index when query changes
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
      className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:p-4 sm:pt-16"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Search Container: Full screen on mobile with safe-area padding; Floating modal on desktop */}
      <div
        className="relative w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-xl bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden focus-visible:outline-none z-10"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 10px)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)',
        }}
      >
        {/* ── Top Bar: Back Button + Spacious Search Bar ── */}
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-3.5 py-3 sm:px-5">
          {/* Back Arrow button */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition flex-shrink-0"
            aria-label="Close search"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Search Input Box */}
          <div className="relative flex-1 flex items-center rounded-xl bg-slate-100/90 border border-slate-200/60 px-3 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition">
            <Search className="h-4 w-4 text-indigo-500 mr-2 flex-shrink-0" aria-hidden="true" />
            <input
              id="global-search-input"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search subjects, notes, question papers..."
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none leading-tight"
              autoComplete="off"
              spellCheck="false"
            />

            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400 flex-shrink-0" aria-hidden="true" />
            ) : query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 transition flex-shrink-0"
                aria-label="Clear search input"
              >
                <X className="h-3 w-3" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                ESC
              </kbd>
            )}
          </div>
        </div>

        {/* ── Scrollable Results / Suggestions ────────── */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-5"
          tabIndex={-1}
        >
          {/* Default State: Popular Subjects & Recent Materials */}
          {!cleanQuery && (
            <div className="space-y-6">
              {/* Popular Subjects */}
              <div>
                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                  Subjects
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        onClose();
                        router.push(`/category/${cat.id}`);
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 active:scale-95 transition shadow-2xs"
                    >
                      <span>{getSubjectEmoji(cat.name)}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Materials */}
              {documents.length > 0 && (
                <div>
                  <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                    Recent Study Materials ({documents.length} available)
                  </p>
                  <div className="space-y-2">
                    {documents.slice(0, 5).map((doc) => {
                      const isKey = doc.title.toLowerCase().includes('answer');
                      const isModel = doc.title.toLowerCase().includes('model') || doc.title.toLowerCase().includes('samagra');
                      const isEM = doc.title.toUpperCase().includes('[EM]') || doc.title.toUpperCase().includes('EM ');
                      const isMM = doc.title.toUpperCase().includes('[MM]') || doc.title.toUpperCase().includes('MM ');

                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => {
                            onClose();
                            router.push(`/read/${doc.id}`);
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 text-left shadow-2xs hover:border-indigo-300 active:scale-[0.99] transition group"
                        >
                          <div
                            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border ${
                              isKey
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                : isModel
                                ? 'bg-violet-50 border-violet-100 text-violet-600'
                                : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                            }`}
                          >
                            {isKey ? (
                              <CheckCircle2 className="h-4.5 w-4.5" />
                            ) : isModel ? (
                              <Bookmark className="h-4.5 w-4.5" />
                            ) : (
                              <FileText className="h-4.5 w-4.5" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                              {isKey ? (
                                <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700">
                                  Answer Key
                                </span>
                              ) : (
                                <span className="rounded bg-indigo-50 px-1.5 py-0.2 text-[9px] font-bold text-indigo-700">
                                  Question Paper
                                </span>
                              )}
                              {isEM && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-bold text-slate-700">
                                  EM
                                </span>
                              )}
                              {isMM && (
                                <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                                  MM
                                </span>
                              )}
                            </div>
                            <p className="truncate text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                              {doc.title}
                            </p>
                          </div>

                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active Search Results: Subject Matches */}
          {cleanQuery && matchingCategories.length > 0 && (
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Matching Subjects ({matchingCategories.length})
              </p>
              <div className="space-y-1.5">
                {matchingCategories.map((cat, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={cat.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => navigateToResult({ type: 'category', data: cat })}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex cursor-pointer items-center justify-between rounded-2xl p-3 text-sm transition-all select-none ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold'
                          : 'bg-white border border-slate-200/70 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl">{getSubjectEmoji(cat.name)}</span>
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className="text-xs text-indigo-600 flex items-center gap-0.5 font-bold">
                        Browse <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Search Results: Document Matches */}
          {cleanQuery && matchingDocuments.length > 0 && (
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Matching Documents ({matchingDocuments.length})
              </p>
              <div className="space-y-2">
                {matchingDocuments.map((doc, idx) => {
                  const itemIndex = matchingCategories.length + idx;
                  const isSelected = selectedIndex === itemIndex;
                  const catName = categoryMap.get(doc.categoryId);
                  const isKey = doc.title.toLowerCase().includes('answer');
                  const isModel = doc.title.toLowerCase().includes('model');

                  return (
                    <div
                      key={doc.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => navigateToResult({ type: 'document', data: doc })}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl p-3 text-sm transition-all select-none ${
                        isSelected
                          ? 'bg-indigo-50 border-2 border-indigo-500 shadow-xs'
                          : 'bg-white border border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border ${
                          isKey
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            : isModel
                            ? 'bg-violet-50 border-violet-100 text-violet-600'
                            : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                        }`}
                      >
                        {isKey ? (
                          <CheckCircle2 className="h-4.5 w-4.5" />
                        ) : (
                          <FileText className="h-4.5 w-4.5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs font-semibold text-slate-800 leading-snug">
                          {doc.title}
                        </p>
                        {catName && (
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                            {catName}
                          </p>
                        )}
                      </div>

                      <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state when searching but no matches */}
          {cleanQuery && results.length === 0 && (
            <div className="p-8 text-center my-4">
              <Search className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No matching study materials found</p>
              <p className="mt-1 text-xs text-slate-400">
                Try searching with another keyword or subject name.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
