'use client';

import Link from 'next/link';
import { FileText, ExternalLink, Eye, Clock } from 'lucide-react';
import { Document } from '@/types';

interface DocumentCardProps {
  document: Document;
}

function formatDate(ts: unknown) {
  if (!ts) return '';
  // Handle both real Firestore Timestamps (with .toDate()) and
  // plain objects serialized across the RSC boundary ({seconds, nanoseconds}).
  if (typeof ts === 'object' && ts !== null) {
    if ('toDate' in ts && typeof (ts as Record<string, unknown>).toDate === 'function') {
      return (ts as { toDate: () => Date }).toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    if ('seconds' in ts) {
      return new Date((ts as { seconds: number }).seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  }
  return '';
}

export default function DocumentCard({ document: doc }: DocumentCardProps) {
  const isDrive = doc.type === 'drive_link';

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 sm:p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5 hover:border-slate-200 active:scale-[0.99]">

      {/* Icon */}
      <div className={`flex h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-xl border transition-colors duration-200 ${
        isDrive
          ? 'bg-blue-50 border-blue-100 group-hover:bg-blue-100'
          : 'bg-red-50 border-red-100 group-hover:bg-red-100'
      }`}>
        {isDrive
          ? <ExternalLink className="h-4 w-4 text-blue-500" />
          : <FileText className="h-4 w-4 text-red-500" />
        }
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors duration-200 leading-tight">
          {doc.title}
        </h3>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            isDrive ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
          }`}>
            {isDrive ? 'Google Drive' : 'PDF'}
          </span>
          {doc.createdAt && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3 w-3" />
              {formatDate(doc.createdAt)}
            </span>
          )}
        </div>
      </div>

      {/* Read button */}
      <Link
        href={`/read/${doc.id}`}
        className="flex-shrink-0 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:shadow-md hover:shadow-indigo-300/50 hover:scale-105 active:scale-95 min-h-[40px] min-w-[40px]"
      >
        <Eye className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Read</span>
      </Link>
    </div>
  );
}
