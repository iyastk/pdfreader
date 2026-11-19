'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
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
    <div className="mx-auto max-w-5xl px-6 sm:px-10 py-6 sm:py-8 focus:outline-none pb-32" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
      
      {/* ── Header: Title & Clean Full-Width Segmented Tabs ── */}
      <div className="mb-6 space-y-4">
        <div style={{ paddingLeft: '4px' }}>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            SSLC Resource Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {filteredDocuments.length} model question papers, answer keys & modules
          </p>
        </div>

        {/* Dedicated Full-Width Segmented Switcher (Square with small round edges & generous X padding) */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 border border-slate-200/70 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '12px', paddingBottom: '12px' }}
            className={`flex items-center justify-center gap-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'directory'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ListOrdered className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Directory ({documents.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('webview')}
            style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '12px', paddingBottom: '12px' }}
            className={`flex items-center justify-center gap-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'webview'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Live Page View</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: CURATED DIRECTORY VIEW ─────────────── */}
      {activeTab === 'directory' && (
        <div className="space-y-0">
          
          {/* Search Input with generous margin and comfortable padding */}
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, year, district..."
              className="w-full rounded-2xl border border-slate-200/90 bg-white pl-11 pr-10 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full h-5 w-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type Filter Tabs: Modern Square Tabs with Ample X-Padding in Both Directions */}
          <div className="mb-4">
            <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2.5 pt-1 scrollbar-none -mx-6 px-6 sm:-mx-10 sm:px-10">
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
                  style={{ paddingLeft: '22px', paddingRight: '22px' }}
                  className={`flex-shrink-0 whitespace-nowrap rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all shadow-2xs ${
                    typeFilter === f.id
                      ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-600/20'
                      : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Filter Tabs: Square Tabs with Ample X-Padding in Both Directions */}
          <div className="mb-7">
            <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2.5 pt-1 scrollbar-none -mx-6 px-6 sm:-mx-10 sm:px-10">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                style={{ paddingLeft: '22px', paddingRight: '22px' }}
                className={`flex-shrink-0 whitespace-nowrap rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all shadow-2xs ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-500 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Subjects
              </button>
              {activeCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{ paddingLeft: '22px', paddingRight: '22px' }}
                  className={`flex-shrink-0 whitespace-nowrap rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all shadow-2xs ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-500 shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50'
                  }`}
                >
                  {getSubjectEmoji(cat.name)} {cat.name} ({cat.documentCount})
                </button>
              ))}
            </div>
          </div>

          {/* ── Document List ─────────────────────────── */}
          {documentsByCategory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center my-6">
              <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-sm sm:text-base font-bold text-slate-700">No materials match your filter</h3>
              <p className="text-xs text-slate-400 mt-1">Try clearing your search query or changing filters</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setTypeFilter('all');
                  setSearchQuery('');
                }}
                className="mt-4 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {documentsByCategory.map(({ category, docs }) => (
                <div key={category.id} className="space-y-2.5">
                  
                  {/* Category Section Header with proper padding */}
                  <div className="flex items-center justify-between px-1 pt-3 pb-1 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-base" role="img" aria-hidden="true">
                        {getSubjectEmoji(category.name)}
                      </span>
                      <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                        {category.name}
                      </h2>
                      <span className="rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5">
                        {docs.length}
                      </span>
                    </div>

                    <Link
                      href={`/category/${category.id}`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition"
                    >
                      <span>View All</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Clean List Tiles with generous padding & spacing */}
                  <div className="space-y-2">
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
                          className="group flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-3.5 shadow-2xs hover:border-indigo-300 hover:shadow-xs active:scale-[0.99] transition-all select-none"
                        >
                          {/* Leading Icon */}
                          <div
                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${
                              isKey
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                : isModel
                                ? 'bg-violet-50 border-violet-100 text-violet-600'
                                : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                            }`}
                          >
                            {isKey ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : isModel ? (
                              <Bookmark className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            {/* Badges with generous gap */}
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              {isKey ? (
                                <span className="rounded-md bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  Answer Key
                                </span>
                              ) : (
                                <span className="rounded-md bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                                  Question Paper
                                </span>
                              )}
                              {isEM && (
                                <span className="rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                                  EM
                                </span>
                              )}
                              {isMM && (
                                <span className="rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                                  MM
                                </span>
                              )}
                              {isDIET && (
                                <span className="rounded-md bg-sky-50 border border-sky-200 px-1.5 py-0.5 text-[10px] font-bold text-sky-800">
                                  DIET
                                </span>
                              )}
                            </div>

                            {/* Cleaned Title */}
                            <p className="line-clamp-2 text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug">
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
        <div className="space-y-4 pt-1">
          {/* Quick Direct Drive Reader Bar */}
          <form onSubmit={handleDirectUrlSubmit} className="flex gap-2">
            <input
              type="url"
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
              placeholder="Paste any Google Drive or PDF link to open in reader..."
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 shadow-2xs"
            />
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 active:scale-95 transition shadow-xs"
            >
              Read
            </button>
            <button
              type="button"
              onClick={() => setIframeKey((k) => k + 1)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-600 hover:bg-slate-50 transition shadow-2xs"
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
