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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true);

    const onInstall = (e: Event) => { e.preventDefault(); setInstallPrompt(e as BeforeInstallPromptEvent); };
    const onScroll = () => setScrolled(window.scrollY > 8);

    window.addEventListener('beforeinstallprompt', onInstall);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('beforeinstallprompt', onInstall);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') { setInstallPrompt(null); setIsInstalled(true); }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-sm shadow-indigo-100/50 border-b border-indigo-100/80'
          : 'bg-white/70 backdrop-blur-md border-b border-transparent'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 h-14 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-300/40 transition-all duration-300 group-hover:scale-110 group-hover:shadow-indigo-400/50">
            <BookOpen className="h-4.5 w-4.5 text-white" strokeWidth={2.5} size={18} />
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="leading-none">
            <span className="text-base font-black tracking-tight text-slate-900">SSLC</span>
            <span className="text-base font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"> Reader</span>
          </div>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-2">
          {installPrompt && !isInstalled && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:shadow-lg hover:shadow-indigo-300/50 hover:scale-105 active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              Install App
            </button>
          )}
          <div className="hidden items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 sm:flex border border-indigo-100">
            <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-700">Study Portal</span>
          </div>
        </div>
      </div>
    </header>
  );
}
