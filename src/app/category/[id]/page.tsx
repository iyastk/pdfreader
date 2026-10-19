import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import DocumentCard from '@/components/DocumentCard';
import EmptyState from '@/components/EmptyState';
import SearchBar from './SearchBar';
import { getCategoryById, getDocumentsByCategory } from '@/lib/firestore';
import { ArrowLeft, FolderOpen, FileText } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 60;

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
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Subjects
          </Link>
          <span>/</span>
          <span className="font-medium text-gray-600 truncate max-w-[200px]">{category.name}</span>
        </div>

        {/* Header */}
        <div className="mb-6 flex items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
            <FolderOpen className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{category.name}</h1>
            <div className="mt-0.5 flex items-center gap-1.5 text-gray-500">
              <FileText className="h-3.5 w-3.5" />
              <span className="text-sm">{documents.length} document{documents.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Search + List */}
        {documents.length === 0 ? (
          <EmptyState
            title="No documents yet"
            message="The admin hasn't uploaded any documents to this subject yet."
          />
        ) : (
          <div className="space-y-4">
            <SearchBar documents={documents} />
          </div>
        )}
      </main>
    </>
  );
}
