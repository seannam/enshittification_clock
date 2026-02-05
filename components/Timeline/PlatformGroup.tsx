interface PlatformGroupProps {
  platformName: string;
  eventCount: number;
  children: React.ReactNode;
}

export function PlatformGroup({
  platformName,
  eventCount,
  children,
}: PlatformGroupProps) {
  return (
    <div className="mb-8">
      {/* Platform header */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 py-3 px-4 -mx-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-gray-600">
              {platformName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{platformName}</h3>
            <p className="text-sm text-gray-500">
              {eventCount} event{eventCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Events */}
      {children}
    </div>
  );
}
