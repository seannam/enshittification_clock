import { Suspense } from 'react';
import { Clock } from '@/components/Clock/Clock';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export const revalidate = 3600; // Revalidate every hour

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <Clock />
      </Suspense>
    </main>
  );
}
