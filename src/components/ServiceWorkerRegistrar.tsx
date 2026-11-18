'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function ServiceWorkerRegistrar() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        registrationRef.current = reg;

        // Check if there is already a waiting worker
        if (reg.waiting) {
          setUpdateAvailable(true);
        }

        // Listen for new worker installed
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available!
              setUpdateAvailable(true);
            }
          });
        });

        // Proactively check for updates immediately
        reg.update().catch(() => {});
      })
      .catch((err) => console.error('[SW] Registration failed', err));

    // Check for updates when user returns to the tab or app
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && registrationRef.current) {
        registrationRef.current.update().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic background update check every 15 minutes
    const interval = setInterval(() => {
      if (registrationRef.current) {
        registrationRef.current.update().catch(() => {});
      }
    }, 15 * 60 * 1000);

    // Capture the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem('pwa-banner-dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleUpdate = useCallback(() => {
    if (registrationRef.current && registrationRef.current.waiting) {
      registrationRef.current.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
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

  return (
    <>
      {/* 🚀 New Update Notification Toast */}
      {updateAvailable && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-3 left-4 right-4 z-[9999] sm:left-auto sm:right-6 sm:max-w-md animate-bounce-subtle"
        >
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-white/98 backdrop-blur-xl p-3.5 shadow-xl shadow-indigo-900/10">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 flex-shrink-0">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 leading-tight">New Materials Updated!</p>
                <p className="text-[11px] text-slate-500 truncate leading-tight">Tap to load the latest notes & papers</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleUpdate}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition flex-shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Update
            </button>
          </div>
        </div>
      )}

      {/* PWA Install Banner */}
      {showBanner && !updateAvailable && (
        <div
          role="dialog"
          aria-labelledby="pwa-install-title"
          aria-describedby="pwa-install-desc"
          className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm animate-slide-up"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-indigo-200/60 bg-white/95 backdrop-blur-xl p-4 shadow-xl shadow-indigo-900/10">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-300/40" aria-hidden="true">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p id="pwa-install-title" className="text-sm font-semibold text-slate-800">Install SSLC Reader</p>
              <p id="pwa-install-desc" className="text-xs text-slate-500">Add to your home screen for instant access</p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                aria-label="Dismiss install prompt"
              >
                Later
              </button>
              <button
                type="button"
                onClick={handleInstall}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:shadow-md active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                aria-label="Install App now"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
