import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import { getCategoriesWithCounts, getDocuments } from '@/lib/firestore';
import PortalClient from './PortalClient';

export const metadata: Metadata = {
  title: 'SSLC Resource Hub & Portal — SSLC Reader',
  description: 'Complete SSLC subject notes, model question papers, answer keys and DIET modules safe for Family Link devices.',
};

export const dynamic = 'force-dynamic';

export default async function PortalPage() {
  let categories: Awaited<ReturnType<typeof getCategoriesWithCounts>> = [];
  let documents: Awaited<ReturnType<typeof getDocuments>> = [];

  try {
    [categories, documents] = await Promise.all([
      getCategoriesWithCounts(),
      getDocuments(),
    ]);
  } catch (error) {
    console.error('Failed to load portal data:', error);
  }

  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="focus:outline-none min-h-[calc(100vh-56px)] pb-20 sm:pb-12">
        <PortalClient categories={categories} documents={documents} />
      </main>
    </>
  );
}
