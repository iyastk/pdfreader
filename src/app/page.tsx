import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import { getCategoriesWithCounts } from '@/lib/firestore';
import CategoryCard from '@/components/CategoryCard';
import EmptyState from '@/components/EmptyState';
import { BookOpen, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SSLC Reader — Study Smarter',
  description: 'Browse SSLC study materials organized by subject.',
};

// Revalidate every 60 seconds for fresh category counts
export const revalidate = 60;

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof getCategoriesWithCounts>> = [];

  try {
    categories = await getCategoriesWithCounts();
  } catch (e) {
    console.error('Failed to fetch categories:', e);
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="relative mb-8 overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 px-5 py-8 sm:px-8 sm:py-12 text-white shadow-xl shadow-indigo-200">
          {/* Background circles */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/5" />

          <div className="relative">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Your Study Companion
            </div>
            <h1 className="mb-2 text-2xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              SSLC Study Materials
            </h1>
            <p className="max-w-xl text-sm sm:text-lg text-indigo-100">
              Browse textbooks, notes, and papers organized by subject. Read anywhere, anytime.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
              <div className="rounded-xl bg-white/15 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium backdrop-blur-sm">
                📚 {categories.length} Subjects
              </div>
              <div className="rounded-xl bg-white/15 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium backdrop-blur-sm">
                📄 {categories.reduce((s, c) => s + c.documentCount, 0)} Documents
              </div>
            </div>
          </div>
        </section>

        {/* Categories grid */}
        <section id="subjects">
          <div className="mb-5 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            <h2 className="text-xl font-bold text-gray-800">Subjects</h2>
          </div>

          {categories.length === 0 ? (
            <EmptyState
              title="No subjects yet"
              message="The admin hasn't added any study materials yet. Check back soon!"
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
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
