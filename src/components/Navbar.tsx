'use client';

import Link from 'next/link';
import { BookOpen, GraduationCap, Download } from 'lucide-react';
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Navbar() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstalled(true);
    }
  };

  return (
    <header
      className="sticky top-0 z-40 border-b border-indigo-100 bg-white/80 backdrop-blur-md"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md shadow-indigo-200 transition-transform group-hover:scale-105">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-gray-900">SSLC</span>
            <span className="text-lg font-bold tracking-tight text-indigo-600"> Reader</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Install PWA button — shown only when installable */}
          {installPrompt && !isInstalled && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95"
              aria-label="Install app"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Install App</span>
            </button>
          )}

          <div className="hidden items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 sm:flex">
            <GraduationCap className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">Study Portal</span>
          </div>
        </div>
      </div>
    </header>
  );
}
