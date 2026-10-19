'use client';

import Link from 'next/link';
import { BookOpen, ChevronRight, FileText } from 'lucide-react';

interface CategoryCardProps {
  id: string;
  name: string;
  documentCount: number;
  index: number;
}

const THEMES = [
  { from: 'from-indigo-500',   to: 'to-violet-600',   shadow: 'shadow-indigo-200',  icon: 'bg-indigo-50',  text: 'text-indigo-600'  },
  { from: 'from-sky-500',      to: 'to-cyan-600',      shadow: 'shadow-sky-200',     icon: 'bg-sky-50',     text: 'text-sky-600'     },
  { from: 'from-emerald-500',  to: 'to-teal-600',      shadow: 'shadow-emerald-200', icon: 'bg-emerald-50', text: 'text-emerald-600' },
  { from: 'from-orange-500',   to: 'to-red-500',       shadow: 'shadow-orange-200',  icon: 'bg-orange-50',  text: 'text-orange-600'  },
  { from: 'from-pink-500',     to: 'to-rose-600',      shadow: 'shadow-pink-200',    icon: 'bg-pink-50',    text: 'text-pink-600'    },
  { from: 'from-violet-500',   to: 'to-purple-600',    shadow: 'shadow-violet-200',  icon: 'bg-violet-50',  text: 'text-violet-600'  },
  { from: 'from-amber-500',    to: 'to-orange-500',    shadow: 'shadow-amber-200',   icon: 'bg-amber-50',   text: 'text-amber-600'   },
  { from: 'from-lime-500',     to: 'to-green-600',     shadow: 'shadow-lime-200',    icon: 'bg-lime-50',    text: 'text-lime-600'    },
];

export default function CategoryCard({ id, name, documentCount, index }: CategoryCardProps) {
  const theme = THEMES[index % THEMES.length];

  return (
    <Link href={`/category/${id}`} className="group block fade-up" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-white border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60 hover:border-slate-200 active:scale-[0.97]">

        {/* Gradient header */}
        <div className={`bg-gradient-to-br ${theme.from} ${theme.to} p-4 sm:p-5`}>
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Curved wave */}
        <div
          className={`absolute left-0 right-0 h-5 bg-gradient-to-br ${theme.from} ${theme.to} opacity-90`}
          style={{ top: 'calc(3.5rem + 8px)', clipPath: 'ellipse(58% 100% at 50% 0%)' }}
        />

        {/* Content */}
        <div className="px-3.5 sm:px-5 pb-4 sm:pb-5 pt-3">
          <h3 className="mt-1.5 text-sm sm:text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2 leading-snug">
            {name}
          </h3>

          <div className="mt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1 text-slate-400">
              <FileText className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{documentCount} {documentCount === 1 ? 'doc' : 'docs'}</span>
            </div>
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-slate-50 border border-slate-100 transition-all group-hover:bg-indigo-50 group-hover:border-indigo-100">
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-500 transition-all group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
