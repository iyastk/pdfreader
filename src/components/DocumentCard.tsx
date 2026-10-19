'use client';

import Link from 'next/link';
import { FileText, ExternalLink, Eye, Clock } from 'lucide-react';
import { Document } from '@/types';
import { Timestamp } from 'firebase/firestore';

interface DocumentCardProps {
  document: Document;
}

function formatDate(ts: Timestamp | undefined) {
  if (!ts) return '';
  const date = ts.toDate();
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DocumentCard({ document: doc }: DocumentCardProps) {
  return (
    <div className="group flex items-center gap-3 sm:gap-4 rounded-xl border border-gray-100 bg-white p-3 sm:p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200 active:bg-gray-50">
      {/* Icon */}
      <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 border border-red-100">
        {doc.type === 'drive_link' ? (
          <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
        ) : (
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm sm:text-base font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
          {doc.title}
        </h3>
        <div className="mt-1 flex items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            {doc.type === 'drive_link' ? 'Drive' : 'PDF'}
          </span>
          {doc.createdAt && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              {formatDate(doc.createdAt)}
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      <Link
        href={`/read/${doc.id}`}
        className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700 active:scale-95 min-h-[44px] min-w-[44px] justify-center"
      >
        <Eye className="h-4 w-4" />
        <span className="hidden sm:inline">Read</span>
      </Link>
    </div>
  );
}
