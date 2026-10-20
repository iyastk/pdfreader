'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Trash2,
  Search,
  FolderOpen,
  ExternalLink,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Document, Category } from '@/types';
import { getDocuments, getCategories, deleteDocument } from '@/lib/firestore';

function formatDate(ts: unknown) {
  if (!ts) return '—';
  if (typeof ts === 'object' && ts !== null) {
    if ('toDate' in ts && typeof (ts as Record<string, unknown>).toDate === 'function') {
      return (ts as { toDate: () => Date }).toDate().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
    }
    if ('seconds' in ts) {
      return new Date((ts as { seconds: number }).seconds * 1000).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
    }
  }
  return '—';
}

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [docs, cats] = await Promise.all([getDocuments(), getCategories()]);
      setDocuments(docs);
      const catMap: Record<string, string> = {};
      cats.forEach((c) => { catMap[c.id] = c.name; });
      setCategories(catMap);
    } catch {
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteDocument(id);
      await load();
    } catch {
      setError('Failed to delete document.');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      (categories[d.categoryId] || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-800">
            All Documents
            <span className="ml-2 text-sm font-normal text-gray-400">{documents.length} total</span>
          </h2>
        </div>
        <div className="flex flex-1 items-center gap-3 sm:justify-end">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button
            onClick={load}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-indigo-500 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <FolderOpen className="mx-auto mb-3 h-12 w-12 text-gray-200" />
          <p className="text-gray-400">
            {search ? 'No documents match your search.' : 'No documents yet.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Added</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((doc) => (
                <tr key={doc.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 flex-shrink-0 text-red-400" />
                      <span className="font-medium text-gray-800 line-clamp-1">{doc.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                      <FolderOpen className="h-3 w-3" />
                      {categories[doc.categoryId] || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      doc.type === 'drive_link'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {doc.type === 'drive_link' ? (
                        <><ExternalLink className="h-3 w-3" /> Google Drive</>
                      ) : (
                        <><FileText className="h-3 w-3" /> Uploaded</>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{formatDate(doc.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(doc.id, doc.title)}
                      disabled={deletingId === doc.id}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition-all hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
