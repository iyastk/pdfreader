import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import DocumentCard from '@/components/DocumentCard';
import EmptyState from '@/components/EmptyState';
import SearchBar from './SearchBar';
import { getCategoryById, getDocumentsByCategory } from '@/lib/firestore';
import { ArrowLeft, FolderOpen, FileText } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const category = await getCategoryById(id);
  return {
    title: category ? `${category.name} — SSLC Reader` : 'Category — SSLC Reader',
    description: category ? `Browse all study materials in ${category.name}` : '',
  };
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  const [category, documents] = await Promise.all([
    getCategoryById(id),
    getDocumentsByCategory(id),
  ]);

  if (!category) notFound();

  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-5 sm:px-8 py-5 sm:py-8 focus:outline-none">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 -ml-2 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
            aria-label="Back to all subjects"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="font-medium">Subjects</span>
          </Link>
          <span className="text-slate-300" aria-hidden="true">/</span>
          <span className="font-semibold text-slate-700 truncate max-w-[180px] sm:max-w-xs" aria-current="page">
            {category.name}
          </span>
        </nav>

        {/* Header card */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
            <FolderOpen className="h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight truncate">
              {category.name}
            </h1>
            <div className="mt-1 flex items-center gap-1.5 text-slate-400">
              <FileText className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-sm font-medium">
                {documents.length} {documents.length === 1 ? 'document' : 'documents'}
              </span>
            </div>
          </div>
        </div>

        {/* Search + Document list */}
        {documents.length === 0 ? (
          <EmptyState
            title="No documents yet"
            message="The admin hasn't uploaded any documents to this subject yet."
          />
        ) : (
          <SearchBar documents={documents} />
        )}
      </main>
    </>
  );
}
