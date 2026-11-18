import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SearchProvider } from '@/context/SearchContext';
import { PWAProvider } from '@/context/PWAContext';
import MobileBottomNav from '@/components/MobileBottomNav';

export const metadata: Metadata = {
  title: 'SSLC Reader — Study Smarter',
  description:
    'A modern educational PDF reader for SSLC students. Browse, search, and read study materials organized by subject.',
  keywords: ['SSLC', 'PDF reader', 'study materials', 'educational', 'Karnataka'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SSLC Reader',
  },
  openGraph: {
    title: 'SSLC Reader — Study Smarter',
    description: 'Browse and read SSLC study materials organized by subject.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-xl focus:bg-indigo-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <PWAProvider>
            <SearchProvider>
              {children}
              <MobileBottomNav />
            </SearchProvider>
          </PWAProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
