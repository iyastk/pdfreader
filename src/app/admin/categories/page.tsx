import type { Metadata } from 'next';
import CategoryManager from '@/components/admin/CategoryManager';

export const metadata: Metadata = { title: 'Categories — Admin | SSLC Reader' };

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Categories</h1>
        <p className="mt-1 text-sm text-gray-400">Manage subject folders for your study materials.</p>
      </div>
      <CategoryManager />
    </div>
  );
}
