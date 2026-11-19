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
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-6 sm:px-10 py-6 sm:py-8 focus:outline-none pb-28">

        {/* ── Header with Generous Left & Right Margins ── */}
        <section className="mb-5">
          <div className="mb-3.5 pl-0.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Kerala SSLC Materials
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {categories.length} subjects • {totalDocs} question papers & notes
            </p>
          </div>

          {/* Quick Search with comfortable padding */}
          <HomeSearchBar />
        </section>

        {/* ── Spacious SSLC Resource Hub Gateway Banner ── */}
        <Link
          href="/portal"
          className="mb-6 flex items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-4 sm:p-5 text-white shadow-xs transition-all hover:shadow-md hover:opacity-95 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm flex-shrink-0">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight truncate">
                2026 Model Exams & Answer Keys Hub
              </p>
              <p className="text-xs text-indigo-100/90 leading-tight truncate mt-1">
                Samagra 3-Set, DIET & District Modules
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-white/20 px-4 py-2 text-xs font-bold backdrop-blur-sm flex-shrink-0 ml-3">
            <span>Explore</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>

        {/* ── Subjects Section ──────────────────────── */}
        <section id="subjects" aria-labelledby="subjects-heading">
          <div className="mb-4 pl-0.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" aria-hidden="true" />
              <h2 id="subjects-heading" className="text-base sm:text-lg font-bold text-slate-900">
                Subjects
              </h2>
            </div>
            {categories.length > 0 && (
              <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
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
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
