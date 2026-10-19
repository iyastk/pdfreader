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
    <div
      className="flex h-screen flex-col bg-slate-950"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* ── Top bar ───────────────────────────────── */}
      <header
        className="flex flex-shrink-0 items-center gap-2 border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-md px-3 sm:px-4"
        style={{
          paddingTop: 'max(10px, env(safe-area-inset-top, 10px))',
          paddingBottom: '10px',
          minHeight: '56px',
        }}
      >
        {/* Back */}
        <Link
          href={`/category/${document.categoryId}`}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-400 transition-all hover:bg-slate-700 hover:text-white hover:border-slate-600 active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        {/* Title */}
        <div className="min-w-0 flex-1 px-1">
          {category && (
            <p className="hidden text-[10px] font-medium text-slate-500 sm:block truncate">
              {category.name}
            </p>
          )}
          <h1 className="truncate text-sm font-semibold text-white leading-tight">
            {document.title}
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {document.type === 'firebase_upload' && (
            <a
              href={document.fileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 sm:w-auto sm:px-3 items-center justify-center sm:gap-1.5 rounded-xl border border-slate-700/60 bg-slate-800/60 text-xs font-medium text-slate-300 transition-all hover:bg-slate-700 hover:text-white active:scale-95"
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
            className="flex h-9 w-9 sm:w-auto sm:px-3 items-center justify-center sm:gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-xs font-semibold text-white shadow-sm shadow-indigo-900/30 transition-all hover:shadow-md hover:shadow-indigo-700/40 active:scale-95"
            aria-label="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Open</span>
          </a>
        </div>
      </header>

      {/* ── PDF Viewer ───────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        <PDFViewer url={document.fileUrl} type={document.type} title={document.title} />
      </div>
    </div>
  );
}
