import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { convertDriveLink } from '@/lib/firestore';
import PDFViewer from './[id]/PDFViewer';

export const metadata: Metadata = {
  title: 'Direct Reader — SSLC Reader',
  description: 'In-app PDF and Document Viewer safe for Family Link devices.',
};

interface SearchParams {
  url?: string;
  title?: string;
}

export default async function DirectReadPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { url, title } = await searchParams;

  if (!url) {
    redirect('/');
  }

  const normalizedUrl = convertDriveLink(url);
  const displayTitle = title ? decodeURIComponent(title) : 'SSLC Study Material';
  const docType = url.includes('firebasestorage') ? 'firebase_upload' : 'drive_link';

  return (
    <div
      className="flex h-screen h-[100dvh] flex-col bg-slate-950 overflow-hidden"
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
          href="/portal"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-300 transition-all hover:bg-slate-700 hover:text-white hover:border-slate-600 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          aria-label="Back to SSLC Hub"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>

        {/* Title */}
        <div className="min-w-0 flex-1 px-1">
          <p className="hidden text-[10px] font-medium text-indigo-400 sm:block truncate">
            In-App Safe Reader (Family Link Protected)
          </p>
          <h1 className="truncate text-sm font-semibold text-white leading-tight">
            {displayTitle}
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <a
            href={normalizedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 sm:w-auto sm:px-3 items-center justify-center sm:gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-xs font-semibold text-white shadow-sm shadow-indigo-900/30 transition-all hover:shadow-md hover:shadow-indigo-700/40 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Open document in external tab"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Open URL</span>
          </a>
        </div>
      </header>

      {/* ── PDF Viewer ───────────────────────────── */}
      <main id="main-content" tabIndex={-1} className="flex-1 overflow-hidden focus:outline-none">
        <PDFViewer url={normalizedUrl} type={docType} title={displayTitle} />
      </main>
    </div>
  );
}

