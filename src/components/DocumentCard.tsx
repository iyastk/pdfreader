'use client';

import Link from 'next/link';
import { FileText, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { Document } from '@/types';

interface DocumentCardProps {
  document: Document;
}

export default function DocumentCard({ document: doc }: DocumentCardProps) {
  const isDrive = doc.type === 'drive_link';
  const titleLower = doc.title.toLowerCase();
  const isAnswerKey = titleLower.includes('answer key') || titleLower.includes('answer');
  const isEM = doc.title.toUpperCase().includes('[EM]') || doc.title.toUpperCase().includes('(EM)') || doc.title.toUpperCase().includes('ENGLISH MEDIUM');
  const isMM = doc.title.toUpperCase().includes('[MM]') || doc.title.toUpperCase().includes('(MM)') || doc.title.toUpperCase().includes('MALAYALAM MEDIUM');
  const isModel = titleLower.includes('model') || titleLower.includes('samagra');
  const isDIET = titleLower.includes('diet') || titleLower.includes('module');

  return (
    <Link
      href={`/read/${doc.id}`}
      aria-label={`Read ${doc.title}`}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:shadow-md hover:shadow-slate-200/60 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none select-none"
    >
      {/* Icon */}
      <div
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-105 ${
          isAnswerKey
            ? 'bg-emerald-50 border-emerald-200/70 text-emerald-600'
            : isModel
            ? 'bg-violet-50 border-violet-200/70 text-violet-600'
            : isDIET
            ? 'bg-sky-50 border-sky-200/70 text-sky-600'
            : 'bg-indigo-50 border-indigo-200/70 text-indigo-600'
        }`}
      >
        {isAnswerKey ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        ) : isModel ? (
          <BookOpen className="h-5 w-5 text-violet-600" />
        ) : (
          <FileText className="h-5 w-5 text-indigo-600" />
        )}
      </div>

      {/* Info & Badges */}
      <div className="min-w-0 flex-1">
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
          {doc.title}
        </h3>

        {/* Badges */}
        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
          {isAnswerKey ? (
            <span className="inline-flex items-center rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
              Answer Key
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
              Question Paper
            </span>
          )}

          {isEM && (
            <span className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
              EM
            </span>
          )}
          {isMM && (
            <span className="inline-flex items-center rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
              MM
            </span>
          )}
          {isDIET && (
            <span className="inline-flex items-center rounded-md bg-sky-50 border border-sky-200 px-1.5 py-0.5 text-[10px] font-bold text-sky-800">
              DIET
            </span>
          )}

          <span className="text-[10px] text-slate-400 ml-auto hidden xs:inline">
            In-App PDF
          </span>
        </div>
      </div>

      {/* Read Arrow Button */}
      <div className="flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
