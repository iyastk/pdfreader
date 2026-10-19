import type { Metadata } from 'next';
import DocumentUploader from '@/components/admin/DocumentUploader';

export const metadata: Metadata = { title: 'Upload PDF — Admin | SSLC Reader' };

export default function AdminUploadPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Upload PDF</h1>
        <p className="mt-1 text-sm text-gray-400">
          Add a new PDF either by direct upload or Google Drive link.
        </p>
      </div>
      <DocumentUploader />
    </div>
  );
}
