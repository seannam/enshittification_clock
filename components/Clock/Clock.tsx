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
      <section className="min-h-[calc(100vh-56px)] flex flex-col justify-center px-4 py-8" aria-label="Enshittification Clock">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Enshittification Clock
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tracking the degradation of major tech platforms and services over time
            </p>
          </div>

          <ClockFace level={clockState.level} color={clockState.color} />
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
