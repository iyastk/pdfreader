'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  ExternalLink,
  ShieldCheck,
  Globe,
  ListOrdered,
  FileText,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Filter,
  ArrowUpRight,
  CheckCircle,
} from 'lucide-react';
import { Category, Document } from '@/types';

interface PortalClientProps {
  categories: Array<Category & { documentCount: number }>;
  documents: Document[];
}

export default function PortalClient({ categories, documents }: PortalClientProps) {
  const [activeTab, setActiveTab] = useState<'directory' | 'webview'>('directory');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'qp' | 'key' | 'model' | 'diet'>('all');
  const [directUrl, setDirectUrl] = useState('');
  const [iframeKey, setIframeKey] = useState(0);

  // Filter documents based on category, search query, and type filter
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Category filter
      if (selectedCategory !== 'all' && doc.categoryId !== selectedCategory) {
        return false;
      }

      const titleLower = doc.title.toLowerCase();

      // Type filter
      if (typeFilter === 'qp' && !titleLower.includes('question') && !titleLower.includes('qp') && !titleLower.includes('exam')) {
        return false;
      }
      if (typeFilter === 'key' && !titleLower.includes('answer') && !titleLower.includes('key')) {
        return false;
      }
      if (typeFilter === 'model' && !titleLower.includes('model') && !titleLower.includes('samagra') && !titleLower.includes('set')) {
        return false;
      }
      if (typeFilter === 'diet' && !titleLower.includes('diet') && !titleLower.includes('module')) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase().trim();
        return titleLower.includes(queryLower);
      }

      return true;
    });
  }, [documents, selectedCategory, typeFilter, searchQuery]);

  // Group filtered documents by category
  const documentsByCategory = useMemo(() => {
    const map = new Map<string, { category: Category; docs: Document[] }>();
    
    // Initialize for existing categories
    categories.forEach((cat) => {
      map.set(cat.id, { category: cat, docs: [] });
    });

    filteredDocuments.forEach((doc) => {
      const entry = map.get(doc.categoryId);
      if (entry) {
        entry.docs.push(doc);
      }
    });

    return Array.from(map.values()).filter((item) => item.docs.length > 0);
  }, [categories, filteredDocuments]);

  // Handle direct URL opening
  const handleDirectUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUrl.trim()) return;
    const target = `/read?url=${encodeURIComponent(directUrl.trim())}&title=${encodeURIComponent('Aplusblog Resource')}`;
    window.location.href = target;
  };

  return (
    <div className="mx-auto max-w-7xl px-3.5 py-4 sm:py-8 sm:px-6 lg:px-8">
      {/* ── Top Header Banner ────────────────────────── */}
      <div className="relative mb-6 overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-900 p-4 sm:p-8 text-white shadow-xl shadow-indigo-300/30">
        <div className="relative z-10">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Family Link Safe
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              Aplusblog SSLC Portal
            </span>
          </div>

          <h1 className="mb-2 text-2xl sm:text-4xl font-black tracking-tight text-white">
            SSLC Resource Hub & Portal
          </h1>
          <p className="max-w-2xl text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
            All Kerala SSLC subject notes, model papers, 2026 exam answer keys & DIET modules arranged cleanly in one place. All files open directly in your in-app PDF reader without opening any external browser!
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-5 flex items-center gap-2 border-t border-indigo-600/60 pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'directory'
                  ? 'bg-white text-indigo-900 shadow-md scale-102'
                  : 'bg-white/10 text-indigo-100 hover:bg-white/20'
              }`}
            >
              <ListOrdered className="h-4 w-4" />
              <span>Organized Directory ({filteredDocuments.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('webview')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'webview'
                  ? 'bg-white text-indigo-900 shadow-md scale-102'
                  : 'bg-white/10 text-indigo-100 hover:bg-white/20'
              }`}
            >
              <Globe className="h-4 w-4" />
              <span>Live Aplusblog Page View</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── TAB 1: CURATED DIRECTORY VIEW ─────────────── */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Search & Filter Toolbar */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-sm space-y-3.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, model papers, answer keys, DIET modules..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200/60 rounded-full h-5 w-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Type Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mr-1">
                <Filter className="h-3 w-3" /> Filter:
              </span>
              {[
                { id: 'all', label: 'All Materials' },
                { id: 'qp', label: 'Question Papers' },
                { id: 'key', label: 'Answer Keys' },
                { id: 'model', label: 'Model Exams (Samagra)' },
                { id: 'diet', label: 'DIET District Modules' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTypeFilter(f.id as typeof typeFilter)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    typeFilter === f.id
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Subject Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : 'bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                All Subjects ({documents.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                      : 'bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  {cat.name} ({cat.documentCount})
                </button>
              ))}
            </div>
          </div>

          {/* Grouped Document Cards by Category */}
          {documentsByCategory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">No materials match your filter</h3>
              <p className="text-xs text-slate-400 mt-1">Try clearing search or changing the subject filter</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setTypeFilter('all');
                  setSearchQuery('');
                }}
                className="mt-4 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            documentsByCategory.map(({ category, docs }) => (
              <section key={category.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-sm shadow-sm shadow-indigo-200">
                      {category.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                        {category.name}
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        {docs.length} material{docs.length !== 1 ? 's' : ''} available
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/category/${category.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition"
                  >
                    <span>View All</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {docs.map((doc) => {
                    const isKey = doc.title.toLowerCase().includes('answer');
                    const isQP = doc.title.toLowerCase().includes('question') || doc.title.toLowerCase().includes('exam');
                    const isEM = doc.title.toUpperCase().includes('[EM]') || doc.title.toUpperCase().includes('EM ');
                    const isMM = doc.title.toUpperCase().includes('[MM]') || doc.title.toUpperCase().includes('MM ');
                    const isDIET = doc.title.toUpperCase().includes('DIET') || doc.title.toUpperCase().includes('MODULE');

                    return (
                      <Link
                        key={doc.id}
                        href={`/read/${doc.id}`}
                        className="group flex flex-col justify-between rounded-xl border border-slate-200/70 bg-slate-50/50 p-3.5 transition-all hover:border-indigo-300 hover:bg-white hover:shadow-md active:scale-98"
                      >
                        <div>
                          {/* Badges */}
                          <div className="mb-2 flex flex-wrap items-center gap-1.5">
                            {isKey && (
                              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                Answer Key
                              </span>
                            )}
                            {isQP && !isKey && (
                              <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                                Question Paper
                              </span>
                            )}
                            {isEM && (
                              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                                EM
                              </span>
                            )}
                            {isMM && (
                              <span className="rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-800">
                                MM
                              </span>
                            )}
                            {isDIET && (
                              <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-800">
                                DIET
                              </span>
                            )}
                          </div>

                          <h3 className="line-clamp-2 text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug">
                            {doc.title}
                          </h3>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-slate-200/50 pt-2 text-[11px] text-indigo-600 font-bold">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3 text-indigo-500" />
                            Read In-App
                          </span>
                          <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      )}

      {/* ── TAB 2: LIVE IN-APP APLUSBLOG WEBVIEW ────────── */}
      {activeTab === 'webview' && (
        <div className="space-y-4">
          {/* Safe Webview Toolbar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  Aplusblog SSLC Page (In-App Sandbox)
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  Family Link Approved
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIframeKey((k) => k + 1)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition active:scale-95"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                  Reload Page
                </button>
                <a
                  href="https://www.aplusblog.in/p/sslc_15.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Original Link
                </a>
              </div>
            </div>

            {/* Quick URL Reader Form */}
            <form onSubmit={handleDirectUrlSubmit} className="mt-3 flex flex-col sm:flex-row items-center gap-2 pt-3 border-t border-slate-100">
              <label htmlFor="direct-drive-input" className="text-xs font-semibold text-slate-600 flex-shrink-0">
                Open Drive/PDF Link in Reader:
              </label>
              <input
                id="direct-drive-input"
                type="url"
                value={directUrl}
                onChange={(e) => setDirectUrl(e.target.value)}
                placeholder="Paste any Google Drive or PDF link here..."
                className="w-full sm:flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="submit"
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition"
              >
                Read In App
              </button>
            </form>
          </div>

          {/* Embedded Web View Container */}
          <div className="relative w-full rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md">
            <iframe
              key={iframeKey}
              src="https://www.aplusblog.in/p/sslc_15.html"
              title="Aplusblog SSLC Resource Portal"
              className="w-full h-[78vh] min-h-[550px] border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
}

