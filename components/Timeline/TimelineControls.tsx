'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { ToggleGroup } from '@/components/shared/ToggleGroup';
import { FilterDropdown } from '@/components/shared/FilterDropdown';
import type { EventType } from '@/lib/supabase/types';
import type { ViewMode, LayoutMode, FilterType } from '@/lib/utils/timeline-helpers';
import { buildTimelineParams, parseTimelineParams } from '@/lib/utils/timeline-helpers';

interface TimelineControlsProps {
  availableEventTypes: EventType[];
}

const viewOptions: { value: ViewMode; label: string }[] = [
  { value: 'unified', label: 'Unified' },
  { value: 'by-platform', label: 'By Platform' },
];

const layoutOptions: { value: LayoutMode; label: string }[] = [
  { value: 'vertical', label: 'Vertical' },
  { value: 'horizontal', label: 'Horizontal' },
];

export function TimelineControls({ availableEventTypes }: TimelineControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { view, layout, filter } = parseTimelineParams(searchParams);

  const updateParams = useCallback(
    (newView: ViewMode, newLayout: LayoutMode, newFilter: FilterType) => {
      const params = buildTimelineParams(newView, newLayout, newFilter);
      router.push(`/timeline?${params}`, { scroll: false });
    },
    [router]
  );

  const handleViewChange = (newView: ViewMode) => {
    updateParams(newView, layout, filter);
  };

  const handleLayoutChange = (newLayout: LayoutMode) => {
    updateParams(view, newLayout, filter);
  };

  const handleFilterChange = (newFilter: FilterType) => {
    updateParams(view, layout, newFilter);
  };

  // Build filter options from available event types
  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All Events' },
    ...availableEventTypes.map((type) => ({
      value: type as FilterType,
      label: type,
    })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <ToggleGroup
        options={viewOptions}
        value={view}
        onChange={handleViewChange}
        label="View:"
      />

      <ToggleGroup
        options={layoutOptions}
        value={layout}
        onChange={handleLayoutChange}
        label="Layout:"
      />

      <FilterDropdown
        options={filterOptions}
        value={filter}
        onChange={handleFilterChange}
        label="Filter:"
      />
    </div>
  );
}
