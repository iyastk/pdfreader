'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircle, Loader2, RefreshCw, ExternalLink } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  type: 'firebase_upload' | 'drive_link';
  title: string;
}

// Timeout before auto-advancing to next strategy (ms)
const STRATEGY_TIMEOUT_MS = 8000;
// Max total time before showing manual controls
const MAX_TOTAL_TIMEOUT_MS = 25000;

/**
 * Viewer strategies in priority order for Drive links.
 *
 * 1. drive_embed – Standard /preview embed (fastest when it works)
 * 2. gview       – Google's lightweight viewer (most reliable fallback)
 * 3. docs_viewer – Google Docs Viewer wrapping a direct download URL
 */
type DriveStrategy = 'drive_embed' | 'gview' | 'docs_viewer';
const DRIVE_STRATEGIES: DriveStrategy[] = ['drive_embed', 'gview', 'docs_viewer'];

function getDriveFileId(url: string): string | null {
  const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

function buildSrc(
  url: string,
  type: 'firebase_upload' | 'drive_link',
  strategy: DriveStrategy
): string {
  if (type === 'firebase_upload') {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  }

  const fileId = getDriveFileId(url);

  switch (strategy) {
    case 'gview': {
      // Google gview with direct-download URL — works for most public PDFs
      if (fileId) {
        const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        return `https://docs.google.com/gview?url=${encodeURIComponent(directUrl)}&embedded=true`;
      }
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }
    case 'drive_embed': {
      // Standard Drive /preview embed
      if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
      return url;
    }
    case 'docs_viewer': {
      // Google Docs Viewer (slightly different endpoint from gview)
      if (fileId) {
        const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        return `https://docs.google.com/viewer?url=${encodeURIComponent(directUrl)}&embedded=true`;
      }
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    default:
      return url;
  }
}

export default function PDFViewer({ url, type, title }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [strategyIndex, setStrategyIndex] = useState(0);
  const [remountKey, setRemountKey] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(Date.now());

  const strategy = type === 'drive_link' ? DRIVE_STRATEGIES[strategyIndex] : 'gview';
  const src = buildSrc(url, type, strategy as DriveStrategy);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (totalTimerRef.current) clearTimeout(totalTimerRef.current);
  }, []);

  // Advance to the next strategy automatically
  const advanceStrategy = useCallback(() => {
    if (type !== 'drive_link') {
      // Firebase uploads only use one strategy
      setFailed(true);
      setLoading(false);
      return;
    }
    const nextIndex = strategyIndex + 1;
    if (nextIndex < DRIVE_STRATEGIES.length) {
      setStrategyIndex(nextIndex);
      setRemountKey((k) => k + 1);
      setLoading(true);
      setFailed(false);
    } else {
      // All strategies exhausted
      setFailed(true);
      setLoading(false);
    }
  }, [type, strategyIndex]);

  // Start timers whenever src or remountKey changes
  useEffect(() => {
    setLoading(true);
    setFailed(false);
    startTimeRef.current = Date.now();

    // Per-strategy timeout: auto-advance
    timerRef.current = setTimeout(() => {
      advanceStrategy();
    }, STRATEGY_TIMEOUT_MS);

    // Total timeout: hard stop
    totalTimerRef.current = setTimeout(() => {
      clearTimers();
      setFailed(true);
      setLoading(false);
    }, MAX_TOTAL_TIMEOUT_MS);

    return clearTimers;
  }, [src, remountKey, advanceStrategy, clearTimers]);

  const handleLoad = () => {
    clearTimers();
    setLoading(false);
    setFailed(false);
  };

  const handleError = () => {
    clearTimers();
    advanceStrategy();
  };

  // Manual retry: restart from current strategy
  const retry = () => {
    setRemountKey((k) => k + 1);
    setLoading(true);
    setFailed(false);
  };

  // Reset to first strategy and retry
  const retryFromStart = () => {
    setStrategyIndex(0);
    setRemountKey((k) => k + 1);
    setLoading(true);
    setFailed(false);
  };

  const showOverlay = loading || failed;

  return (
    <div className="relative h-full w-full bg-gray-950">
      {/* ── Loading overlay ───────────────────────────── */}
      {loading && !failed && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-950">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          </div>
          <p className="text-sm font-medium text-gray-300">Loading document…</p>
          <p className="mt-1 max-w-xs text-center text-xs text-gray-500">
            {type === 'drive_link'
              ? `Trying viewer ${strategyIndex + 1} of ${DRIVE_STRATEGIES.length}…`
              : 'Fetching via Google Docs Viewer…'}
          </p>
          <button
            onClick={() => {
              clearTimers();
              setLoading(false);
              setFailed(true);
            }}
            className="mt-4 rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:text-gray-300 transition"
          >
            Taking too long? Tap here
          </button>
        </div>
      )}

      {/* ── Error / failed overlay ───────────────────── */}
      {failed && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-950 p-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>

          <h3 className="mb-2 text-lg font-semibold text-white">
            {strategyIndex >= DRIVE_STRATEGIES.length - 1
              ? 'Unable to Display'
              : 'Viewer taking too long'}
          </h3>
          <p className="mb-6 max-w-sm text-sm text-gray-400">
            {strategyIndex >= DRIVE_STRATEGIES.length - 1
              ? 'All viewer methods have been tried. Please open the file directly.'
              : 'The document viewer is slow or unavailable. You can retry or open the file directly.'}
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <button
              onClick={retry}
              className="flex items-center gap-2 rounded-xl border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-800 active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>

            {strategyIndex > 0 && (
              <button
                onClick={retryFromStart}
                className="flex items-center gap-2 rounded-xl border border-indigo-700/60 bg-indigo-600/20 px-4 py-2.5 text-sm font-medium text-indigo-300 transition hover:bg-indigo-600/30 active:scale-95"
              >
                <RefreshCw className="h-4 w-4" />
                Try All Again
              </button>
            )}

            {strategyIndex < DRIVE_STRATEGIES.length - 1 && type === 'drive_link' && (
              <button
                onClick={advanceStrategy}
                className="flex items-center gap-2 rounded-xl border border-indigo-700/60 bg-indigo-600/20 px-4 py-2.5 text-sm font-medium text-indigo-300 transition hover:bg-indigo-600/30 active:scale-95"
              >
                Try Next Viewer
              </button>
            )}

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-900/30 transition hover:shadow-lg hover:shadow-indigo-700/40 active:scale-95"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Google Drive
            </a>
          </div>
        </div>
      )}

      {/* ── The iframe ────────────────────────────────── */}
      {!failed && (
        <iframe
          key={`${src}-${remountKey}`}
          src={src}
          title={title}
          className="pdf-viewer-frame"
          style={{ opacity: showOverlay ? 0 : 1, transition: 'opacity 0.3s ease' }}
          onLoad={handleLoad}
          onError={handleError}
          allow="autoplay; fullscreen"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}
