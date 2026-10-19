import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import { getCategoriesWithCounts } from '@/lib/firestore';
import CategoryCard from '@/components/CategoryCard';
import EmptyState from '@/components/EmptyState';
import { BookOpen, Sparkles, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SSLC Reader — Study Smarter',
  description: 'Browse SSLC study materials organized by subject.',
};

export const revalidate = 60;

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof getCategoriesWithCounts>> = [];

  try {
    categories = await getCategoriesWithCounts();
  } catch (e) {
    console.error('Failed to fetch categories:', e);
  }

  const totalDocs = categories.reduce((s, c) => s + c.documentCount, 0);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-10 sm:px-6 lg:px-8">

        {/* ── Hero ──────────────────────────────────── */}
        <section className="relative mb-10 overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 sm:p-10 text-white shadow-2xl shadow-indigo-300/40">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/[0.06] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/[0.06] blur-3xl" />
          <div className="pointer-events-none absolute right-1/3 bottom-0 h-40 w-40 rounded-full bg-violet-400/20 blur-2xl" />

          <div className="relative z-10">
            {/* Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              Your Study Companion
            </div>

            <h1 className="mb-3 text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
              SSLC Study<br className="sm:hidden" /> Materials
            </h1>
            <p className="max-w-md text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              Browse textbooks, notes & papers organized by subject. Read anywhere, anytime.
            </p>

            {/* Stats */}
            <div className="mt-5 flex flex-wrap gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm">
                <span className="text-lg">📚</span>
                <div>
                  <p className="text-xs text-indigo-200">Subjects</p>
                  <p className="text-sm font-bold">{categories.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm">
                <span className="text-lg">📄</span>
                <div>
                  <p className="text-xs text-indigo-200">Documents</p>
                  <p className="text-sm font-bold">{totalDocs}</p>
                </div>
              </div>
              {categories.length > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm">
                  <TrendingUp className="h-4 w-4 text-green-300" />
                  <div>
                    <p className="text-xs text-indigo-200">Avg per subject</p>
                    <p className="text-sm font-bold">{Math.round(totalDocs / categories.length)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Subjects ──────────────────────────────── */}
        <section id="subjects">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
              <BookOpen className="h-4 w-4 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Subjects</h2>
            {categories.length > 0 && (
              <span className="ml-auto rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                {categories.length}
              </span>
            )}
          </div>

          {categories.length === 0 ? (
            <EmptyState
              title="No subjects yet"
              message="The admin hasn't added any study materials yet. Check back soon!"
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((cat, index) => (
                <CategoryCard
                  key={cat.id}
                  id={cat.id}
                  name={cat.name}
                  documentCount={cat.documentCount}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
