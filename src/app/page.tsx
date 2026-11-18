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
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-3.5 py-3 sm:py-6 sm:px-6 lg:px-8 focus:outline-none pb-20">

        {/* ── Clean Compact Header ────────────────────── */}
        <section className="mb-3.5">
          <div className="mb-2.5">
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
              Kerala SSLC Materials
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              {categories.length} subjects • {totalDocs} question papers & notes
            </p>
          </div>

          {/* Quick Search */}
          <HomeSearchBar />
        </section>

        {/* ── Compact SSLC Resource Hub Gateway ───────── */}
        <Link
          href="/portal"
          className="mb-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-600 to-violet-700 px-3 py-2.5 text-white shadow-xs transition-all hover:shadow-md hover:opacity-95 active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm flex-shrink-0">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight truncate">
                2026 Model Exams & Answer Keys Hub
              </p>
              <p className="text-[10px] text-indigo-100/90 leading-tight truncate">
                Samagra 3-Set, DIET & District Modules
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 text-xs font-bold flex-shrink-0 ml-2 text-indigo-100">
            <span>Explore</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        {/* ── Subjects Section ──────────────────────── */}
        <section id="subjects" aria-labelledby="subjects-heading">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-indigo-600" aria-hidden="true" />
              <h2 id="subjects-heading" className="text-sm font-bold text-slate-900">
                Subjects
              </h2>
            </div>
            {categories.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
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
            <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
