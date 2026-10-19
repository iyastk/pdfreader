'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Upload,
  Link2,
  FileUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  FilePlus,
} from 'lucide-react';
import { Category } from '@/types';
import { getCategories, createDocument, convertDriveLink } from '@/lib/firestore';
import { uploadPDF } from '@/lib/storage';
import UploadProgress from '@/components/UploadProgress';

type Mode = 'upload' | 'drive';

export default function DocumentUploader() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mode, setMode] = useState<Mode>('upload');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [driveLink, setDriveLink] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadCategories = useCallback(async () => {
    const data = await getCategories();
    setCategories(data);
    if (data.length > 0 && !categoryId) setCategoryId(data[0].id);
  }, [categoryId]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const reset = () => {
    setTitle('');
    setFile(null);
    setDriveLink('');
    setUploadProgress(0);
    setSuccess(false);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!title.trim()) { setError('Please enter a title.'); return; }
    if (!categoryId) { setError('Please select a category.'); return; }

    setUploading(true);

    try {
      if (mode === 'upload') {
        if (!file) { setError('Please choose a PDF file.'); setUploading(false); return; }
        const url = await uploadPDF(file, categoryId, setUploadProgress);
        await createDocument({ title: title.trim(), categoryId, type: 'firebase_upload', fileUrl: url });
      } else {
        if (!driveLink.trim()) { setError('Please paste a Google Drive link.'); setUploading(false); return; }
        const embedUrl = convertDriveLink(driveLink.trim());
        await createDocument({ title: title.trim(), categoryId, type: 'drive_link', fileUrl: embedUrl });
      }
      setSuccess(true);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-800">
        <FilePlus className="h-5 w-5 text-indigo-500" />
        Add New PDF
      </h2>

      {/* Mode tabs */}
      <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
            mode === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileUp className="h-4 w-4" />
          Direct Upload
        </button>
        <button
          type="button"
          onClick={() => setMode('drive')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
            mode === 'drive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Link2 className="h-4 w-4" />
          Google Drive Link
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          >
            {categories.length === 0 && <option value="">No categories — create one first</option>}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Document Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Chapter 1 - Introduction"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* File or Drive link */}
        {mode === 'upload' ? (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">PDF File</label>
            <div
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-8 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mb-2 h-8 w-8 text-gray-300" />
              {file ? (
                <p className="text-sm font-medium text-indigo-600 truncate max-w-[80%]">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-600">Click to select PDF</p>
                  <p className="text-xs text-gray-400">PDF files only</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Google Drive Link</label>
            <input
              type="url"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
            <p className="mt-1.5 text-xs text-gray-400">
              Paste a public Google Drive share link — it will be converted to an embed link automatically.
            </p>
          </div>
        )}

        {/* Progress */}
        {uploading && mode === 'upload' && uploadProgress > 0 && (
          <UploadProgress progress={uploadProgress} fileName={file?.name} />
        )}

        {/* Feedback */}
        {success && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle className="h-4 w-4" />
            PDF added successfully!
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || categories.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:shadow-lg hover:shadow-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
          ) : (
            <><Upload className="h-4 w-4" /> {mode === 'upload' ? 'Upload PDF' : 'Save Link'}</>
          )}
        </button>
      </form>
    </div>
  );
}
