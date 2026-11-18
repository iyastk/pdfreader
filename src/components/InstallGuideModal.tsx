'use client';

import { useEffect } from 'react';
import {
  X,
  Download,
  Share,
  PlusSquare,
  MoreVertical,
  Smartphone,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: 'ios' | 'android' | 'desktop';
  canInstallPrompt?: boolean;
  onNativeInstall?: () => void;
}

export default function InstallGuideModal({
  isOpen,
  onClose,
  platform,
  canInstallPrompt,
  onNativeInstall,
}: InstallGuideModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10 animate-slide-up">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          aria-label="Close install modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header with App Logo */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-300/40 text-white">
            <Smartphone className="h-6 w-6" />
          </div>
          <div className="min-w-0 pr-6">
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> Progressive Web App
            </div>
            <h2 id="install-modal-title" className="text-lg font-bold text-slate-900 leading-tight">
              Install SSLC Reader
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Install the app on your phone for faster loading, full-screen reading without browser bars, and instant access to all question papers!
        </p>

        {/* Direct One-Tap Install (if Android native prompt is available) */}
        {canInstallPrompt && onNativeInstall && (
          <div className="mb-5">
            <button
              type="button"
              onClick={onNativeInstall}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Install App Now
            </button>
            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">Or follow manual steps</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
          </div>
        )}

        {/* Instructions by Platform */}
        {platform === 'ios' ? (
          <div className="space-y-3.5 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Apple iPhone / iPad (Safari):</span>
            </p>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
                  1
                </span>
                <span>
                  Tap the <strong className="text-slate-900 font-semibold inline-flex items-center gap-1"><Share className="h-3.5 w-3.5 inline text-indigo-600" /> Share</strong> button in your Safari toolbar at the bottom.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
                  2
                </span>
                <span>
                  Scroll down the menu and tap <strong className="text-slate-900 font-semibold inline-flex items-center gap-1"><PlusSquare className="h-3.5 w-3.5 inline text-indigo-600" /> Add to Home Screen</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
                  3
                </span>
                <span>
                  Tap <strong className="text-slate-900 font-semibold">Add</strong> at the top-right. The SSLC Reader icon will appear on your home screen!
                </span>
              </div>
            </div>
          </div>
        ) : platform === 'android' ? (
          <div className="space-y-3.5 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Android (Chrome / Samsung Internet):</span>
            </p>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
                  1
                </span>
                <span>
                  Tap the <strong className="text-slate-900 font-semibold inline-flex items-center gap-0.5"><MoreVertical className="h-3.5 w-3.5 inline text-indigo-600" /> menu (three dots)</strong> at the top-right corner of Chrome.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
                  2
                </span>
                <span>
                  Tap <strong className="text-slate-900 font-semibold">Install app</strong> or <strong className="text-slate-900 font-semibold">Add to Home screen</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
                  3
                </span>
                <span>
                  Tap <strong className="text-slate-900 font-semibold">Install</strong> to confirm.
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-xs font-bold text-slate-800">
              Desktop (Chrome / Edge / Brave):
            </p>
            <div className="space-y-2 text-xs text-slate-600">
              <p>
                1. Look for the <strong className="text-slate-900">Install icon (⊕ or ⬇)</strong> in your browser address bar on the right.
              </p>
              <p>
                2. Click <strong className="text-slate-900">Install</strong> to add SSLC Reader as a desktop app.
              </p>
            </div>
          </div>
        )}

        {/* Benefits bullets */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-around text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> No app store needed
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Zero storage waste
          </span>
        </div>
      </div>
    </div>
  );
}
