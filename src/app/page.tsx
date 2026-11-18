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
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-3.5 py-4 sm:py-8 sm:px-6 lg:px-8 focus:outline-none">

        {/* ── Minimalist Clean Header & Search ───────── */}
        <section className="mb-4 pt-1">
          <div className="mb-3">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
              SSLC Study Materials
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {categories.length} subjects • {totalDocs} question papers & notes
            </p>
          </div>

          {/* Quick Search */}
          <HomeSearchBar />
        </section>

        {/* ── Sleek 1-Line SSLC Resource Hub Banner ──── */}
        <Link
          href="/portal"
          className="mb-6 flex items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-3 sm:p-3.5 text-white shadow-xs transition-all hover:shadow-md hover:opacity-95 active:scale-[0.98]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm flex-shrink-0">
              <GraduationCap className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold leading-tight truncate">
                SSLC Resource Hub (2026 Exams & Notes)
              </p>
              <p className="text-[10px] sm:text-xs text-indigo-100/90 leading-tight truncate mt-0.5">
                Samagra 3-Set, Kerala Padavali & DIET modules
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-white/20 px-2.5 py-1 text-xs font-bold backdrop-blur-sm flex-shrink-0 ml-2">
            <span>Open</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        {/* ── Subjects Section ──────────────────────── */}
        <section id="subjects" aria-labelledby="subjects-heading">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" aria-hidden="true" />
              <h2 id="subjects-heading" className="text-base font-bold text-slate-900">
                Subjects
              </h2>
            </div>
            {categories.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
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
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
