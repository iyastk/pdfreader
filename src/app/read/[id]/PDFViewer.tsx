'use client';

import { useState } from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  type: 'firebase_upload' | 'drive_link';
  title: string;
}

export default function PDFViewer({ url, type, title }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // For Firebase uploads: use Google Docs Viewer as a reliable cross-browser renderer
  // For Drive links: already a preview/embed URL
  const iframeSrc =
    type === 'firebase_upload'
      ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
      : url;

  const handleLoad = () => setLoading(false);
  const handleError = () => { setLoading(false); setError(true); };

  return (
    <div className="relative h-full w-full bg-gray-950">
      {/* Loading overlay */}
      {loading && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-950">
          <Loader2 className="mb-3 h-10 w-10 animate-spin text-indigo-400" />
          <p className="text-sm text-gray-400">Loading {title}…</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-950 p-6 text-center">
          <AlertCircle className="mb-3 h-12 w-12 text-red-400" />
          <h3 className="mb-2 text-lg font-semibold text-white">Could not load PDF</h3>
          <p className="mb-6 max-w-sm text-sm text-gray-400">
            The PDF could not be displayed in the browser. You can open it in a new tab or download it.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => { setError(false); setLoading(true); }}
              className="flex items-center gap-2 rounded-xl border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Open in new tab
            </a>
          </div>
        </div>
      )}

      <iframe
        key={iframeSrc}
        src={iframeSrc}
        title={title}
        className="pdf-viewer-frame"
        onLoad={handleLoad}
        onError={handleError}
        allow="autoplay"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
      />
    </div>
  );
}
