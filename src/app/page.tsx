import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getCategoriesWithCounts } from '@/lib/firestore';
import CategoryCard from '@/components/CategoryCard';
import EmptyState from '@/components/EmptyState';
import HomeSearchBar from '@/components/HomeSearchBar';
import { BookOpen, GraduationCap, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SSLC Reader — Study Smarter',
  description: 'Browse SSLC study materials organized by subject.',
};

export const dynamic = 'force-dynamic';

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
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-5 sm:px-8 py-4 sm:py-7 focus:outline-none pb-24">

        {/* ── Clean Compact Header with Generous Side Margins ── */}
        <section className="mb-4">
          <div className="mb-3">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
              Kerala SSLC Materials
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {categories.length} subjects • {totalDocs} question papers & notes
            </p>
          </div>

          {/* Quick Search */}
          <HomeSearchBar />
        </section>

        {/* ── Compact SSLC Resource Hub Gateway ───────── */}
        <Link
          href="/portal"
          className="mb-5 flex items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-3.5 sm:p-4 text-white shadow-xs transition-all hover:shadow-md hover:opacity-95 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm flex-shrink-0">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold leading-tight truncate">
                2026 Model Exams & Answer Keys Hub
              </p>
              <p className="text-[10px] sm:text-xs text-indigo-100/90 leading-tight truncate mt-0.5">
                Samagra 3-Set, DIET & District Modules
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-sm flex-shrink-0 ml-2">
            <span>Explore</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        {/* ── Subjects Section ──────────────────────── */}
        <section id="subjects" aria-labelledby="subjects-heading">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" aria-hidden="true" />
              <h2 id="subjects-heading" className="text-sm sm:text-base font-bold text-slate-900">
                Subjects
              </h2>
            </div>
            {categories.length > 0 && (
              <span className="rounded-xl bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
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
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
