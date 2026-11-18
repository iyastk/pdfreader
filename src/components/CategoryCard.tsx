'use client';

import Link from 'next/link';

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

  return (
    <Link
      href={`/category/${id}`}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition-all hover:border-indigo-400 hover:shadow-md active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none select-none min-h-[96px]"
      aria-label={`${name}, ${documentCount} study materials`}
    >
      {/* Top: Icon + Document Count Pill */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-lg shadow-xs group-hover:scale-105 transition-transform">
          <span role="img" aria-label={name}>{emoji}</span>
        </div>

        <span className="inline-flex items-center rounded-lg bg-indigo-50 border border-indigo-100/90 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
          {documentCount}
        </span>
      </div>

      {/* Bottom: Subject Name */}
      <div className="w-full">
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1 leading-tight">
          {name}
        </h3>
        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
          {documentCount} {documentCount === 1 ? 'material' : 'materials'}
        </p>
      </div>
    </Link>
  );
}
