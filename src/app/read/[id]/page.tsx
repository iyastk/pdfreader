import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getDocumentById, getCategoryById } from '@/lib/firestore';
import { ArrowLeft, ExternalLink, Download } from 'lucide-react';
import PDFViewer from './PDFViewer';

export const revalidate = 3600;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const doc = await getDocumentById(id);
  return {
    title: doc ? `${doc.title} — SSLC Reader` : 'Read — SSLC Reader',
    description: doc ? `Reading: ${doc.title}` : 'PDF Reader',
  };
}

export default async function ReadPage({ params }: Props) {
  const { id } = await params;
  const document = await getDocumentById(id);
  if (!document) notFound();

  const category = await getCategoryById(document.categoryId);

  return (
    <div className="flex h-screen flex-col bg-gray-950" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* Top bar */}
      <header
        className="flex flex-shrink-0 items-center gap-2 border-b border-gray-800 bg-gray-900 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3"
        style={{ paddingTop: 'max(8px, env(safe-area-inset-top, 8px))' }}
      >
        {/* Back button — large tap target on mobile */}
        <Link
          href={`/category/${document.categoryId}`}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-700 hover:text-white active:bg-gray-600"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {/* Title area */}
        <div className="min-w-0 flex-1">
          {category && (
            <p className="hidden text-xs text-gray-500 sm:block">{category.name}</p>
          )}
          <h1 className="truncate text-sm font-semibold text-white leading-tight">
            {document.title}
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {document.type === 'firebase_upload' && (
            <a
              href={document.fileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 sm:h-auto sm:w-auto items-center justify-center sm:gap-1.5 rounded-lg bg-gray-700 sm:px-3 sm:py-1.5 text-xs font-medium text-gray-200 transition hover:bg-gray-600 active:bg-gray-500"
              aria-label="Download"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}
          <a
            href={document.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 sm:h-auto sm:w-auto items-center justify-center sm:gap-1.5 rounded-lg bg-indigo-600 sm:px-3 sm:py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 active:bg-indigo-800"
            aria-label="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Open</span>
          </a>
        </div>
      </header>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-hidden">
        <PDFViewer url={document.fileUrl} type={document.type} title={document.title} />
      </div>
    </div>
  );
}
