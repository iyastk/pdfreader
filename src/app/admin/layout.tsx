'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [user, loading, router, isLoginPage]);

  // Always render the login page — it handles its own UI
  if (isLoginPage) {
    return <>{children}</>;
  }

  // For all other admin pages: show spinner while loading auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not authenticated — returning null while redirect fires
  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full px-4 py-6 sm:px-6 lg:px-8 pt-16 lg:pt-8 lg:pl-8">
          {children}
        </div>
      </main>
    </div>
  );
}
