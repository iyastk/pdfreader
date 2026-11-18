'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  ExternalLink,
  Globe,
  ListOrdered,
  FileText,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';
import { Category, Document } from '@/types';

interface PortalClientProps {
  categories: Array<Category & { documentCount: number }>;
  documents: Document[];
}

function cleanDocumentTitle(title: string, categoryName: string): string {
  let clean = title;
  const catRegex = new RegExp(`sslc[-\\s]*${categoryName}[-\\s]*`, 'gi');
  clean = clean.replace(catRegex, '');
  clean = clean.replace(/\s*-\s*-\s*/g, ' - ').replace(/\s{2,}/g, ' ').trim();
  if (clean.startsWith('- ')) clean = clean.substring(2);
  return clean || title;
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

  // Only show categories that have documents in the subject pill list
  const activeCategories = useMemo(() => {
    return categories.filter((c) => c.documentCount > 0);
  }, [categories]);

  const handleDirectUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUrl.trim()) return;
    const target = `/read?url=${encodeURIComponent(directUrl.trim())}&title=${encodeURIComponent('Aplusblog Resource')}`;
    window.location.href = target;
  };

  return (
    <div className="mx-auto max-w-4xl px-3.5 py-3 sm:py-6 sm:px-6 focus:outline-none pb-24">
      
      {/* ── Minimalist Clean Header & Mode Switcher ──── */}
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            SSLC Resource Hub
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
            {filteredDocuments.length} exam papers, keys & modules
          </p>
        </div>

        {/* Tab Switcher: Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              activeTab === 'directory'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ListOrdered className="h-3.5 w-3.5" />
            <span>Directory</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('webview')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              activeTab === 'webview'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Live Web</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: CURATED DIRECTORY VIEW ─────────────── */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, year, district..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full h-5 w-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type Filter Pills (Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
            {[
              { id: 'all', label: `All (${documents.length})` },
              { id: 'qp', label: 'Question Papers' },
              { id: 'key', label: 'Answer Keys' },
              { id: 'model', label: 'Model Exams (Samagra)' },
              { id: 'diet', label: 'DIET Modules' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTypeFilter(f.id as typeof typeFilter)}
                className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                  typeFilter === f.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Subject Pills (Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  : 'bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100'
              }`}
            >
              All Subjects
            </button>
            {activeCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    : 'bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100'
                }`}
              >
                {cat.name} ({cat.documentCount})
              </button>
            ))}
          </div>

          {/* ── Document List ─────────────────────────── */}
          {documentsByCategory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center mt-4">
              <BookOpen className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No materials match your filter</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Try clearing your search query or filters</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setTypeFilter('all');
                  setSearchQuery('');
                }}
                className="mt-3 rounded-lg bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {documentsByCategory.map(({ category, docs }) => (
                <div key={category.id} className="space-y-1.5">
                  
                  {/* Category Section Header */}
                  <div className="flex items-center justify-between px-1 pt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                        {category.name}
                      </span>
                      <span className="rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.2">
                        {docs.length}
                      </span>
                    </div>

                    <Link
                      href={`/category/${category.id}`}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                    >
                      <span>View All</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>

                  {/* Clean List Tiles */}
                  <div className="space-y-1.5">
                    {docs.map((doc) => {
                      const isKey = doc.title.toLowerCase().includes('answer');
                      const isModel = doc.title.toLowerCase().includes('model') || doc.title.toLowerCase().includes('samagra');
                      const isEM = doc.title.toUpperCase().includes('[EM]') || doc.title.toUpperCase().includes('EM ');
                      const isMM = doc.title.toUpperCase().includes('[MM]') || doc.title.toUpperCase().includes('MM ');
                      const isDIET = doc.title.toUpperCase().includes('DIET') || doc.title.toUpperCase().includes('MODULE');
                      const cleanTitle = cleanDocumentTitle(doc.title, category.name);

                      return (
                        <Link
                          key={doc.id}
                          href={`/read/${doc.id}`}
                          className="group flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-2.5 sm:p-3 shadow-xs hover:border-indigo-300 hover:shadow-sm active:scale-[0.99] transition-all select-none"
                        >
                          {/* Leading Icon */}
                          <div
                            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border ${
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

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            {/* Badges */}
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
                              {isDIET && (
                                <span className="rounded bg-sky-50 px-1.5 py-0.2 text-[9px] font-bold text-sky-800">
                                  DIET
                                </span>
                              )}
                            </div>

                            {/* Cleaned Title */}
                            <p className="line-clamp-2 text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                              {cleanTitle}
                            </p>
                          </div>

                          {/* Trailing Arrow */}
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: LIVE WEB VIEW ──────────────────────── */}
      {activeTab === 'webview' && (
        <div className="space-y-3">
          {/* Quick Direct Drive Reader Bar */}
          <form onSubmit={handleDirectUrlSubmit} className="flex gap-2">
            <input
              type="url"
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
              placeholder="Paste any Google Drive or PDF link to open in reader..."
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 active:scale-95 transition"
            >
              Read
            </button>
            <button
              type="button"
              onClick={() => setIframeKey((k) => k + 1)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-slate-600 hover:bg-slate-50 transition"
              title="Reload portal"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </form>

          {/* Sandbox iframe */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <iframe
              key={iframeKey}
              src="https://www.aplusblog.in/p/sslc_15.html"
              title="Aplusblog SSLC Portal"
              className="w-full h-[70vh] sm:h-[80vh] border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
}
