'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface CategoryCardProps {
  id: string;
  name: string;
  documentCount: number;
  index: number;
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

export default function CategoryCard({ id, name, documentCount }: CategoryCardProps) {
  const emoji = getSubjectEmoji(name);
  const isEmpty = documentCount === 0;

  return (
    <Link
      href={`/category/${id}`}
      className={`group flex items-center gap-3 rounded-2xl border p-3 sm:p-3.5 shadow-xs transition-all hover:shadow-md active:scale-[0.98] select-none ${
        isEmpty
          ? 'border-slate-100 bg-slate-50/70 opacity-60'
          : 'border-slate-200/90 bg-white hover:border-indigo-300'
      }`}
      aria-label={`${name}, ${documentCount} study materials`}
    >
      {/* Icon badge */}
      <div className="flex h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-lg sm:text-xl group-hover:scale-105 transition-transform">
        <span role="img" aria-label={name}>{emoji}</span>
      </div>

      {/* Subject Name & Single Count */}
      <div className="min-w-0 flex-1">
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate leading-tight">
          {name}
        </h3>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
          {isEmpty ? '0 papers' : `${documentCount} ${documentCount === 1 ? 'paper' : 'papers'}`}
        </p>
      </div>

      {/* Subtle chevron */}
      {!isEmpty && (
        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      )}
    </Link>
  );
}
