import Link from 'next/link';
import { BookOpen, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-200">
        <BookOpen className="h-10 w-10 text-white" />
      </div>
      <h1 className="mb-2 text-6xl font-extrabold text-indigo-600">404</h1>
      <h2 className="mb-3 text-2xl font-bold text-gray-800">Page Not Found</h2>
      <p className="mb-8 max-w-sm text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-indigo-700"
      >
        <Home className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}
