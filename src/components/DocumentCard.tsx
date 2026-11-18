'use client';

import Link from 'next/link';
import { FileText, ExternalLink, Eye, Clock, CheckCircle } from 'lucide-react';
import { Document } from '@/types';

interface DocumentCardProps {
  document: Document;
}

function formatDate(ts: unknown) {
  if (!ts) return '';
  if (typeof ts === 'object' && ts !== null) {
    if ('toDate' in ts && typeof (ts as Record<string, unknown>).toDate === 'function') {
      return (ts as { toDate: () => Date }).toDate().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    if ('seconds' in ts) {
      return new Date((ts as { seconds: number }).seconds * 1000).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  }
  return '';
}

export default function DocumentCard({ document: doc }: DocumentCardProps) {
  const isDrive = doc.type === 'drive_link';
  const titleLower = doc.title.toLowerCase();
  const isAnswerKey = titleLower.includes('answer key') || titleLower.includes('answer');
  const isEM = doc.title.includes('(English Medium)') || doc.title.includes('[EM]');
  const isMM = doc.title.includes('(Malayalam Medium)') || doc.title.includes('[MM]');

  return (
    <Link
      href={`/read/${doc.id}`}
      aria-label={`Read ${doc.title}`}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3 sm:p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5 hover:border-slate-200 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
    >
      {/* Icon */}
      <div
        className={`flex h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-xl border transition-colors duration-200 ${
          isAnswerKey
            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
            : isDrive
            ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
            : 'bg-rose-50 border-rose-100 text-rose-600'
        }`}
      >
        {isAnswerKey ? (
          <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
        ) : isDrive ? (
          <ExternalLink className="h-4.5 w-4.5 text-indigo-600" />
        ) : (
          <FileText className="h-4.5 w-4.5 text-rose-500" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2 leading-snug">
          {doc.title}
        </h3>

        {/* Badges */}
        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
          {isAnswerKey ? (
            <span className="inline-flex items-center rounded-md bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
              Answer Key
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
              Question Paper
            </span>
          )}

          {isEM && (
            <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
              EM
            </span>
          )}
          {isMM && (
            <span className="inline-flex items-center rounded-md bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
              MM
            </span>
          )}

          <span className="hidden xs:inline-flex items-center text-[10px] text-slate-400">
            {isDrive ? 'Google Drive' : 'PDF'}
          </span>

          {doc.createdAt && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 ml-auto">
              <Clock className="h-3 w-3" />
              {formatDate(doc.createdAt)}
            </span>
          )}
        </div>
      </div>

      {/* Read Action Button */}
      <div className="flex-shrink-0 flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-white shadow-sm shadow-indigo-200 transition-all group-hover:shadow-md group-hover:scale-105 active:scale-95">
        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="text-[11px] sm:text-xs">Read</span>
      </div>
    </Link>
  );
}