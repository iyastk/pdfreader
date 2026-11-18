'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Maximize2,
  Minimize2,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';

interface PDFViewerProps {
  url: string;
  type: 'firebase_upload' | 'drive_link';
  title: string;
}

// Timeout before auto-advancing to next strategy (ms)
const STRATEGY_TIMEOUT_MS = 9000;
// Max total time before showing manual controls
const MAX_TOTAL_TIMEOUT_MS = 25000;

type FirebaseStrategy = 'direct_pdf' | 'gview' | 'docs_viewer';
type DriveStrategy = 'drive_embed' | 'gview' | 'docs_viewer';

const FIREBASE_STRATEGIES: { id: FirebaseStrategy; label: string }[] = [
  { id: 'direct_pdf', label: 'Native Fast PDF' },
  { id: 'gview', label: 'Google Docs View' },
  { id: 'docs_viewer', label: 'Google Drive Viewer' },
];

const DRIVE_STRATEGIES: { id: DriveStrategy; label: string }[] = [
  { id: 'drive_embed', label: 'Drive Embed' },
  { id: 'gview', label: 'Google Docs View' },
  { id: 'docs_viewer', label: 'Alternative Viewer' },
];

function getDriveFileId(url: string): string | null {
  const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

function buildSrc(
  url: string,
  type: 'firebase_upload' | 'drive_link',
  strategy: string
): string {
  if (type === 'firebase_upload') {
    switch (strategy) {
      case 'direct_pdf':
        // Native PDF embed with toolbar enabled - fastest & works offline
        return `${url}#toolbar=1&navpanes=0`;
      case 'gview':
        return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
      case 'docs_viewer':
        return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      default:
        return `${url}#toolbar=1`;
    }
  }

  const fileId = getDriveFileId(url);

  switch (strategy) {
    case 'drive_embed':
      if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
      return url;
    case 'gview':
      if (fileId) {
        const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
        return `https://docs.google.com/gview?url=${encodeURIComponent(viewUrl)}&embedded=true`;
      }
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    case 'docs_viewer':
      if (fileId) {
        const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
        return `https://docs.google.com/viewer?url=${encodeURIComponent(viewUrl)}&embedded=true`;
      }
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    default:
      return url;
  }
}

export default function PDFViewer({ url, type, title }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [strategyIndex, setStrategyIndex] = useState(0);
  const [remountKey, setRemountKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const strategies = type === 'firebase_upload' ? FIREBASE_STRATEGIES : DRIVE_STRATEGIES;
  const currentStrategy = strategies[strategyIndex] || strategies[0];
  const src = buildSrc(url, type, currentStrategy.id);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (totalTimerRef.current) clearTimeout(totalTimerRef.current);
  }, []);

  // Advance to next strategy
  const advanceStrategy = useCallback(() => {
    const nextIndex = strategyIndex + 1;
    if (nextIndex < strategies.length) {
      setStrategyIndex(nextIndex);
      setRemountKey((k) => k + 1);
      setLoading(true);
      setFailed(false);
    } else {
      // All strategies exhausted
      setFailed(true);
      setLoading(false);
    }
  }, [strategyIndex, strategies.length]);

  // Start timers on src change
  useEffect(() => {
    setLoading(true);
    setFailed(false);

    timerRef.current = setTimeout(() => {
      advanceStrategy();
    }, STRATEGY_TIMEOUT_MS);

    totalTimerRef.current = setTimeout(() => {
      clearTimers();
      setFailed(true);
      setLoading(false);
    }, MAX_TOTAL_TIMEOUT_MS);

    return clearTimers;
  }, [src, remountKey, advanceStrategy, clearTimers]);

  // Track fullscreen changes
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Keyboard shortcuts: 'f' for fullscreen, 'r' to reload
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        retry();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleLoad = () => {
    clearTimers();
    setLoading(false);
    setFailed(false);
  };

  const handleError = () => {
    clearTimers();
    advanceStrategy();
  };

  const retry = () => {
    setRemountKey((k) => k + 1);
    setLoading(true);
    setFailed(false);
  };

  const selectStrategy = (index: number) => {
    setStrategyIndex(index);
    setRemountKey((k) => k + 1);
    setLoading(true);
    setFailed(false);
    setShowControls(false);
  };

  const showOverlay = loading || failed;

  return (
    <div ref={containerRef} className="relative h-full w-full bg-slate-950 flex flex-col">
      {/* ── Mini toolbar (Quick Switcher & Fullscreen) ── */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 rounded-xl bg-slate-900/80 p-1 backdrop-blur-md border border-slate-800 shadow-lg">
        <button
          type="button"
          onClick={() => setShowControls((prev) => !prev)}
          className="flex h-7 px-2 items-center gap-1 rounded-lg text-[11px] font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Viewer options"
          title="Switch viewing engine"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
          <span className="hidden sm:inline">{currentStrategy.label}</span>
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label={isFullscreen ? 'Exit full screen (F)' : 'Enter full screen (F)'}
          title={isFullscreen ? 'Exit full screen (F)' : 'Enter full screen (F)'}
        >
          {isFullscreen ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* ── Viewer Options Dropdown Popover ── */}
      {showControls && (
        <div className="absolute top-11 right-2 z-30 w-52 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Display Engine
          </p>
          <div className="space-y-1">
            {strategies.map((strat, idx) => (
              <button
                key={strat.id}
                type="button"
                onClick={() => selectStrategy(idx)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition ${
                  strategyIndex === idx
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{strat.label}</span>
                {strategyIndex === idx && <span className="text-[10px]">Active</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Loading Overlay ── */}
      {loading && !failed && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 p-4"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          </div>
          <p className="text-sm font-semibold text-slate-200">Loading document…</p>
          <p className="mt-1 max-w-xs text-center text-xs text-slate-400">
            Using {currentStrategy.label} ({strategyIndex + 1}/{strategies.length})
          </p>
          <button
            type="button"
            onClick={() => {
              clearTimers();
              setLoading(false);
              setFailed(true);
            }}
            className="mt-4 rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Taking too long? Tap for options
          </button>
        </div>
      )}

      {/* ── Error / Fallback Overlay ── */}
      {failed && (
        <div
          role="alert"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 p-6 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20">
            <AlertCircle className="h-8 w-8 text-amber-400" />
          </div>

          <h3 className="mb-2 text-lg font-bold text-white">
            {strategyIndex >= strategies.length - 1
              ? 'Preview Unavailable'
              : 'Viewer is Slow'}
          </h3>
          <p className="mb-6 max-w-sm text-sm text-slate-400">
            The embedded viewer took too long to load. You can try an alternative engine or open the document directly.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={retry}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>

            {strategyIndex < strategies.length - 1 && (
              <button
                type="button"
                onClick={advanceStrategy}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-600/20 px-4 py-2 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-600/30 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Try Next Engine
              </button>
            )}

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-900/40 transition hover:shadow-lg active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open File Directly
            </a>
          </div>
        </div>
      )}

      {/* ── Document Frame ── */}
      {!failed && (
        <iframe
          key={`${src}-${remountKey}`}
          src={src}
          title={`Document viewer: ${title}`}
          className="pdf-viewer-frame flex-1 h-full w-full"
          style={{ opacity: showOverlay ? 0 : 1, transition: 'opacity 0.25s ease' }}
          onLoad={handleLoad}
          onError={handleError}
          allow="autoplay; fullscreen"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}