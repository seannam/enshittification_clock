import { Suspense } from 'react';
import { Timeline } from '@/components/Timeline/Timeline';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Timeline | Enshittification Clock',
  description: 'Chronological view of enshittification events across tech platforms',
};

export const revalidate = 3600; // Revalidate every hour

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TimelinePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <Timeline searchParams={resolvedParams} />
      </Suspense>
    </main>
  );
}
