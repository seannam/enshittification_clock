import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { calculateClockState } from '@/lib/utils/clock-calculator';
import { ClockFace } from './ClockFace';
import { ClockLegend } from './ClockLegend';
import { ErrorBoundary } from '../shared/ErrorBoundary';

export async function Clock() {
  const supabase = await createClient();

  // Fetch all events
  const { data: events, error } = await supabase
    .from('enshittification_events')
    .select('*')
    .order('event_date', { ascending: false });

  if (error) {
    console.error('Failed to fetch events:', error);
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Failed to load clock data</p>
      </div>
    );
  }

  // Calculate clock state
  const clockState = calculateClockState(events || []);

  return (
    <ErrorBoundary>
      <section className="px-4" aria-label="Enshittification Clock">
        {/* Hero section - fills viewport */}
        <div className="h-[calc(100vh-56px)] flex flex-col py-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Enshittification Clock
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
              Tracking the degradation of major tech platforms and services over time
            </p>
            <Link
              href="/timeline"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              View the Timeline
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Clock fills remaining space */}
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <ClockFace level={clockState.level} color={clockState.color} />
          </div>
        </div>

        {/* Below the fold */}
        <div className="max-w-4xl mx-auto py-8">
          <ClockLegend position={clockState.position} color={clockState.color} />

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{clockState.eventCount}</p>
              <p className="text-sm text-gray-600">Events tracked</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{clockState.serviceCount}</p>
              <p className="text-sm text-gray-600">Services monitored</p>
            </div>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}
