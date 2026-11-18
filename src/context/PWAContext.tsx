'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import InstallGuideModal from '@/components/InstallGuideModal';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type DevicePlatform = 'ios' | 'android' | 'desktop';

interface PWAContextValue {
  isInstalled: boolean;
  canInstallPrompt: boolean;
  platform: DevicePlatform;
  isInstallModalOpen: boolean;
  openInstallModal: () => void;
  closeInstallModal: () => void;
  promptInstall: () => Promise<void>;
}

const PWAContext = createContext<PWAContextValue | undefined>(undefined);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<DevicePlatform>('android');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  useEffect(() => {
    // 1. Detect if running as standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    // 2. Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // 3. Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.warn('[PWA] SW register error:', err));
    }

    // 4. Capture beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 5. Track if app was installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setIsInstallModalOpen(false);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const openInstallModal = useCallback(() => setIsInstallModalOpen(true), []);
  const closeInstallModal = useCallback(() => setIsInstallModalOpen(false), []);

  const promptInstall = useCallback(async () => {
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setInstallPrompt(null);
          setIsInstallModalOpen(false);
          return;
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    }
    // If native prompt is not available or failed (e.g. iOS Safari, Firefox, or Chrome heuristic not yet ready)
    openInstallModal();
  }, [installPrompt, openInstallModal]);

  return (
    <PWAContext.Provider
      value={{
        isInstalled,
        canInstallPrompt: Boolean(installPrompt),
        platform,
        isInstallModalOpen,
        openInstallModal,
        closeInstallModal,
        promptInstall,
      }}
    >
      {children}
      <InstallGuideModal
        isOpen={isInstallModalOpen}
        onClose={closeInstallModal}
        platform={platform}
        canInstallPrompt={Boolean(installPrompt)}
        onNativeInstall={installPrompt ? promptInstall : undefined}
      />
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const ctx = useContext(PWAContext);
  if (!ctx) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return ctx;
}
