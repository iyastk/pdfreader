'use client';

import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';

interface CategoryCardProps {
  id: string;
  name: string;
  documentCount: number;
  index: number;
}

const THEMES = [
  { from: 'from-indigo-600', to: 'to-indigo-700', bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100' },
  { from: 'from-blue-600',   to: 'to-cyan-600',   bg: 'bg-blue-50',   text: 'text-blue-600',   ring: 'ring-blue-100' },
  { from: 'from-emerald-600',to: 'to-teal-700',  bg: 'bg-emerald-50',text: 'text-emerald-600',ring: 'ring-emerald-100' },
  { from: 'from-amber-600',  to: 'to-orange-700', bg: 'bg-amber-50',  text: 'text-amber-600',  ring: 'ring-amber-100' },
  { from: 'from-rose-600',   to: 'to-pink-700',   bg: 'bg-rose-50',   text: 'text-rose-600',   ring: 'ring-rose-100' },
  { from: 'from-violet-600', to: 'to-purple-700', bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-100' },
  { from: 'from-teal-600',   to: 'to-emerald-700',bg: 'bg-teal-50',   text: 'text-teal-600',   ring: 'ring-teal-100' },
  { from: 'from-fuchsia-600',to: 'to-pink-600',   bg: 'bg-fuchsia-50',text: 'text-fuchsia-600',ring: 'ring-fuchsia-100' },
];

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

export default function CategoryCard({ id, name, documentCount, index }: CategoryCardProps) {
  const theme = THEMES[index % THEMES.length];
  const emoji = getSubjectEmoji(name);

  return (
    <Link
      href={`/category/${id}`}
      className="group block rounded-2xl focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none transition-transform active:scale-[0.96]"
      aria-label={`${name}, ${documentCount} study materials`}
    >
      <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/50 h-full min-h-[120px]">
        
        {/* Top row: Subject Emoji & Count Badge */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-xl shadow-xs group-hover:scale-105 transition-transform">
            <span role="img" aria-label={name}>{emoji}</span>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
            <FileText className="h-3 w-3 text-indigo-500" />
            <span>{documentCount}</span>
          </span>
        </div>

        {/* Bottom row: Subject Name & Arrow */}
        <div className="flex items-end justify-between gap-1 pt-1 border-t border-slate-100">
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
              {name}
            </h3>
          </div>

          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100/70 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
