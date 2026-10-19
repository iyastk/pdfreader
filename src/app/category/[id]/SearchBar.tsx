'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Document } from '@/types';
import DocumentCard from '@/components/DocumentCard';
import EmptyState from '@/components/EmptyState';

interface SearchBarProps {
  documents: Document[];
}

export default function SearchBar({ documents }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documents..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No results"
          message={`No documents match "${query}"`}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </>
  );
}
