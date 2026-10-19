'use client';

import Link from 'next/link';
import { BookOpen, ChevronRight, FileText } from 'lucide-react';

interface CategoryCardProps {
  id: string;
  name: string;
  documentCount: number;
  index: number;
}

const GRADIENTS = [
  'from-indigo-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-pink-500 to-rose-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-lime-500 to-green-600',
];

export default function CategoryCard({ id, name, documentCount, index }: CategoryCardProps) {
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <Link href={`/category/${id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-gray-100 active:scale-95">
        {/* Gradient header */}
        <div className={`bg-gradient-to-br ${gradient} p-4 sm:p-6 pb-8 sm:pb-10`}>
          <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm">
            <BookOpen className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
          </div>
        </div>

        {/* Wave divider */}
        <div
          className={`absolute left-0 right-0 h-6 sm:h-8 bg-gradient-to-br ${gradient}`}
          style={{ top: 'calc(4.25rem)', clipPath: 'ellipse(55% 100% at 50% 0%)' }}
        />

        {/* Content */}
        <div className="px-3 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4">
          <h3 className="mt-1 sm:mt-2 text-sm sm:text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
            {name}
          </h3>
          <div className="mt-2 sm:mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-gray-500">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">{documentCount} doc{documentCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gray-50 transition-all group-hover:bg-indigo-50">
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
