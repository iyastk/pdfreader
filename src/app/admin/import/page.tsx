'use client';

import { useState, useEffect } from 'react';
import {
  Globe,
  Sparkles,
  Search,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  FolderOpen,
  ArrowRight,
  Layers,
  CheckSquare,
  Square,
  RefreshCw,
} from 'lucide-react';
import { Category } from '@/types';
import { getCategories, createDocumentsBatch, convertDriveLink } from '@/lib/firestore';
import { scrapeWebpageForLinks, ScrapedLinkItem, revalidateDocumentPages, revalidateCategoryPages } from '@/app/actions';

export default function AutoImporterPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [inputUrl, setInputUrl] = useState('');
  const [isRawMode, setIsRawMode] = useState(false);
  const [rawText, setRawText] = useState('');

  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [pageTitle, setPageTitle] = useState('');

  const [items, setItems] = useState<
    Array<ScrapedLinkItem & { selected: boolean; chosenCategoryId: string }>
  >([]);

  const [batchCategory, setBatchCategory] = useState('');
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<number | null>(null);
  const [importError, setImportError] = useState('');

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanError('');
    setImportSuccess(null);
    setImportError('');

    const target = isRawMode ? rawText.trim() : inputUrl.trim();
    if (!target) {
      setScanError(isRawMode ? 'Please paste raw HTML or link text.' : 'Please enter a valid website URL.');
      return;
    }

    setScanning(true);
    try {
      const res = await scrapeWebpageForLinks(target, isRawMode);
      if (!res.success) {
        setScanError(res.error || 'Failed to extract links from webpage.');
        setItems([]);
        return;
      }

      setPageTitle(res.pageTitle || '');

      // Map suggested categories to existing category IDs
      const catMap = new Map<string, string>();
      categories.forEach((c) => {
        catMap.set(c.name.toLowerCase().trim(), c.id);
      });

      const processed = res.items.map((item) => {
        let matchedCatId = '';
        if (item.suggestedCategory) {
          const key = item.suggestedCategory.toLowerCase().trim();
          matchedCatId = catMap.get(key) || '';
        }
        if (!matchedCatId && categories.length > 0) {
          // Default to first category if none detected
          matchedCatId = categories[0].id;
        }

        return {
          ...item,
          selected: true,
          chosenCategoryId: matchedCatId,
        };
      });

      setItems(processed);
      if (processed.length === 0) {
        setScanError('No Google Drive or PDF links were found on that page. Try pasting the page HTML directly.');
      }
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Error scanning webpage.');
    } finally {
      setScanning(false);
    }
  };

  const toggleSelectAll = () => {
    const allSelected = items.every((i) => i.selected);
    setItems((prev) => prev.map((i) => ({ ...i, selected: !allSelected })));
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))
    );
  };

  const updateItemTitle = (id: string, newTitle: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, title: newTitle } : i))
    );
  };

  const updateItemCategory = (id: string, catId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, chosenCategoryId: catId } : i))
    );
  };

  const applyBatchCategory = () => {
    if (!batchCategory) return;
    setItems((prev) =>
      prev.map((i) => (i.selected ? { ...i, chosenCategoryId: batchCategory } : i))
    );
  };

  const handleImport = async () => {
    const selectedItems = items.filter((i) => i.selected);
    if (selectedItems.length === 0) {
      setImportError('Please select at least one document to import.');
      return;
    }

    setImporting(true);
    setImportError('');
    setImportSuccess(null);

    try {
      const docsToInsert = selectedItems.map((item) => ({
        title: item.title.trim(),
        categoryId: item.chosenCategoryId,
        type: item.type,
        fileUrl: item.type === 'drive_link' ? convertDriveLink(item.url) : item.url,
      }));

      const insertedCount = await createDocumentsBatch(docsToInsert);

      // Revalidate cache for each touched category
      const touchedCatIds = new Set(docsToInsert.map((d) => d.categoryId));
      for (const catId of touchedCatIds) {
        await revalidateDocumentPages(catId);
      }
      await revalidateCategoryPages();

      setImportSuccess(insertedCount);
      // Remove imported items from list
      setItems((prev) => prev.filter((i) => !i.selected));
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import documents into database.');
    } finally {
      setImporting(false);
    }
  };

  const selectedCount = items.filter((i) => i.selected).length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ── Page Header ── */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          Automated Study Material Scraper
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Web Link Auto-Importer
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter any educational webpage URL or paste links. The system will automatically detect subjects, titles, and Google Drive / PDF files.
        </p>
      </div>

      {/* ── Scraper Input Form ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm">
        {/* Toggle Mode */}
        <div className="flex items-center gap-4 mb-4">
          <button
            type="button"
            onClick={() => setIsRawMode(false)}
            className={`flex items-center gap-1.5 pb-2 text-sm font-semibold border-b-2 transition ${
              !isRawMode
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Globe className="h-4 w-4" />
            Website URL
          </button>
          <button
            type="button"
            onClick={() => setIsRawMode(true)}
            className={`flex items-center gap-1.5 pb-2 text-sm font-semibold border-b-2 transition ${
              isRawMode
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileText className="h-4 w-4" />
            Paste HTML / Raw Links
          </button>
        </div>

        <form onSubmit={handleScan} className="space-y-4">
          {!isRawMode ? (
            <div>
              <label htmlFor="import-url" className="sr-only">
                Webpage URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="import-url"
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://www.hsslive.in/... or https://www.aplusblog.in/..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="import-raw" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Paste Page HTML or Google Drive Links
              </label>
              <textarea
                id="import-raw"
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste webpage source code or plain text list of Drive links here..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Supports HSSLive, Aplusblog, SCERT, Blogger, and any Google Drive table
            </span>
            <button
              type="submit"
              disabled={scanning}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:shadow-lg active:scale-95 disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning Webpage…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Scan & Extract Links
                </>
              )}
            </button>
          </div>
        </form>

        {scanError && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{scanError}</span>
          </div>
        )}
      </div>

      {/* ── Success Banner ── */}
      {importSuccess !== null && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm animate-fade-up">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">
                Successfully imported {importSuccess} document{importSuccess !== 1 ? 's' : ''}!
              </p>
              <p className="text-xs text-emerald-600">
                All study materials are now live on the student portal and organized under their subjects.
              </p>
            </div>
          </div>
          <a
            href="/admin/documents"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
          >
            View Documents <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* ── Extracted Items Preview & Batch Controls ── */}
      {items.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          {/* Header Bar */}
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                {items.every((i) => i.selected) ? (
                  <>
                    <CheckSquare className="h-4 w-4 text-indigo-600" /> Deselect All
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4 text-slate-400" /> Select All ({items.length})
                  </>
                )}
              </button>
              <span className="text-xs font-medium text-slate-500">
                {selectedCount} of {items.length} selected
              </span>
            </div>

            {/* Batch assign category */}
            <div className="flex items-center gap-2">
              <label htmlFor="batch-cat" className="text-xs font-medium text-slate-500 hidden sm:inline">
                Set category for selected:
              </label>
              <select
                id="batch-cat"
                value={batchCategory}
                onChange={(e) => setBatchCategory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="">Choose Subject...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={applyBatchCategory}
                disabled={!batchCategory}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 z-10">
                <tr>
                  <th className="py-3 pl-4 pr-2 w-10"></th>
                  <th className="py-3 px-3">Document Title</th>
                  <th className="py-3 px-3 w-44">Subject / Category</th>
                  <th className="py-3 px-3 w-28">Type</th>
                  <th className="py-3 pr-4 pl-2 w-14 text-right">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      item.selected ? 'bg-indigo-50/20' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <td className="py-2.5 pl-4 pr-2">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleItem(item.id)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateItemTitle(item.id, e.target.value)}
                        className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs font-semibold text-slate-800 transition hover:border-slate-200 focus:border-indigo-400 focus:bg-white focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={item.chosenCategoryId}
                        onChange={(e) => updateItemCategory(item.id, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-indigo-500"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                        {item.type === 'drive_link' ? 'Google Drive' : 'PDF File'}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 pl-2 text-right">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition"
                        title="Test link in new tab"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 p-4">
            {importError && (
              <p className="text-xs text-red-500 font-medium">{importError}</p>
            )}
            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={handleImport}
                disabled={importing || selectedCount === 0}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:shadow-lg active:scale-95 disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing to Database…
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Import Selected ({selectedCount} Documents)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';
