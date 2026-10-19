'use client';

import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
}

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
      {/* Animated icon */}
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-indigo-100 blur-xl opacity-60 scale-150" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-200/50 shadow-inner">
          <FolderOpen className="h-8 w-8 text-indigo-400" strokeWidth={1.5} />
        </div>
      </div>

      <h3 className="text-base font-bold text-slate-700">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-slate-400 leading-relaxed">{message}</p>
    </div>
  );
}
