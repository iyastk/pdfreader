'use client';

import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title = 'Nothing here yet',
  message = 'No items found.',
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
        {icon ?? <FolderOpen className="h-10 w-10 text-indigo-400" />}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-gray-700">{title}</h3>
      <p className="max-w-sm text-gray-400">{message}</p>
    </div>
  );
}
