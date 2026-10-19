import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import MobileBottomNav from '@/components/MobileBottomNav';

const inter = Inter({ subsets: ['latin'] });

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
  maximumScale: 1,
  userScalable: false,
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
      <body className={inter.className}>
        <AuthProvider>
          <ServiceWorkerRegistrar />
          {children}
          <MobileBottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
