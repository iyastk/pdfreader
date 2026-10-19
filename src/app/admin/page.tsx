import type { Metadata } from 'next';
import { LayoutDashboard, FolderOpen, FileText, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { getCategoriesWithCounts } from '@/lib/firestore';

export const metadata: Metadata = { title: 'Dashboard — Admin | SSLC Reader' };

export const revalidate = 60;

export default async function AdminDashboardPage() {
  let cats: Awaited<ReturnType<typeof getCategoriesWithCounts>> = [];
  try { cats = await getCategoriesWithCounts(); } catch {}

  const totalDocs = cats.reduce((s, c) => s + c.documentCount, 0);

  const STAT_CARDS = [
    {
      label: 'Total Subjects',
      value: cats.length,
      icon: FolderOpen,
      color: 'from-indigo-500 to-purple-600',
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
    },
    {
      label: 'Total Documents',
      value: totalDocs,
      icon: FileText,
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
    },
    {
      label: 'Avg per Subject',
      value: cats.length ? Math.round(totalDocs / cats.length) : 0,
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-gray-900">
          <LayoutDashboard className="h-6 w-6 text-indigo-500" />
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Overview of your SSLC Reader content.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, text }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-md`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{value}</p>
            <p className="mt-1 text-sm text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/categories"
            className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 group-hover:bg-indigo-100 transition">
              <FolderOpen className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Manage Categories</p>
              <p className="text-xs text-gray-400">Create & delete subjects</p>
            </div>
          </Link>
          <Link
            href="/admin/upload"
            className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Upload PDF</p>
              <p className="text-xs text-gray-400">Add new study materials</p>
            </div>
          </Link>
          <Link
            href="/admin/documents"
            className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 group-hover:bg-purple-100 transition">
              <LayoutDashboard className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">All Documents</p>
              <p className="text-xs text-gray-400">View & delete PDFs</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Category breakdown */}
      {cats.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">Category Breakdown</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {cats.map((cat) => {
              const pct = totalDocs > 0 ? (cat.documentCount / totalDocs) * 100 : 0;
              return (
                <li key={cat.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">{cat.name}</span>
                    <span className="text-sm text-gray-400">{cat.documentCount} docs</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
