'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, FolderPlus, FolderOpen, AlertCircle, Loader2 } from 'lucide-react';
import { Category } from '@/types';
import { getCategories, createCategory, deleteCategory } from '@/lib/firestore';

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setError('');
    try {
      await createCategory(name);
      setNewName('');
      await load();
    } catch {
      setError('Failed to create category.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all its documents? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteCategory(id);
      await load();
    } catch {
      setError('Failed to delete category.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
          <FolderPlus className="h-5 w-5 text-indigo-500" />
          New Category
        </h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g., Maths, Social Science..."
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create
          </button>
        </form>
        {error && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        )}
      </div>

      {/* Categories list */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <FolderOpen className="h-5 w-5 text-indigo-500" />
            All Categories
            <span className="ml-auto text-sm font-normal text-gray-400">{categories.length} total</span>
          </h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center">
            <FolderOpen className="mx-auto mb-3 h-12 w-12 text-gray-200" />
            <p className="text-gray-400">No categories yet. Create one above.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                  <FolderOpen className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{cat.name}</p>
                  <p className="text-xs text-gray-400">ID: {cat.id}</p>
                </div>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  disabled={deletingId === cat.id}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  title="Delete category"
                >
                  {deletingId === cat.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
