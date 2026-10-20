'use client';

import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function ServiceWorkerRegistrar() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('[SW] Registered', reg.scope))
        .catch((err) => console.error('[SW] Registration failed', err));
    }

    // Capture the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Only show the banner if user hasn't dismissed it before
      const dismissed = localStorage.getItem('pwa-banner-dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log('[PWA] Install outcome:', outcome);
    setInstallPrompt(null);
    setShowBanner(false);
  }, [installPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm animate-slide-up"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-indigo-200/60 bg-white/95 backdrop-blur-xl p-4 shadow-xl shadow-indigo-900/10">
        {/* Icon */}
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-300/40">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
          </svg>
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">Install SSLC Reader</p>
          <p className="text-xs text-slate-500">Add to your home screen for quick access</p>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            onClick={handleDismiss}
            className="rounded-lg px-2 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:shadow-md active:scale-95"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
