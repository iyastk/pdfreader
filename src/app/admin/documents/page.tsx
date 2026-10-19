import type { Metadata } from 'next';
import DocumentList from '@/components/admin/DocumentList';

export const metadata: Metadata = { title: 'Documents — Admin | SSLC Reader' };

export default function AdminDocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">All Documents</h1>
        <p className="mt-1 text-sm text-gray-400">View, search, and delete uploaded PDFs.</p>
      </div>
      <DocumentList />
    </div>
  );
}
