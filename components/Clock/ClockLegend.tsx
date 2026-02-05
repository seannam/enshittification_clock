interface ClockLegendProps {
  position: string;
  color: string;
}

const legendItems = [
  { level: '0-20', label: 'Early warning', color: 'green' },
  { level: '21-40', label: 'Noticeable decline', color: 'yellow' },
  { level: '41-60', label: 'Significant degradation', color: 'orange' },
  { level: '61-80', label: 'Severe enshittification', color: 'red' },
  { level: '81-100', label: 'Critical / Terminal', color: 'darkred' },
];

const colorClasses: Record<string, string> = {
  green: 'bg-clock-green',
  yellow: 'bg-clock-yellow',
  orange: 'bg-clock-orange',
  red: 'bg-clock-red',
  darkred: 'bg-clock-darkred',
};

export function ClockLegend({ position, color }: ClockLegendProps) {
  return (
    <div className="mt-8 max-w-md mx-auto">
      {/* Current position */}
      <div className="mb-4 text-center">
        <p className="text-base text-gray-600 mb-1">Current state:</p>
        <p className={`text-2xl font-bold ${colorClasses[color] ? '' : 'text-gray-900'}`}>
          <span className={`${colorClasses[color]} bg-clip-text text-transparent`}>
            {position}
          </span>
        </p>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Enshittification Scale
        </h3>
        <div className="space-y-2">
          {legendItems.map((item) => (
            <div
              key={item.level}
              className={`flex items-center gap-3 py-2 px-2 rounded transition-colors ${
                item.color === color ? 'bg-gray-50' : ''
              }`}
            >
              <div className={`w-4 h-4 rounded-full flex-shrink-0 ${colorClasses[item.color]}`} />
              <div className="min-w-0">
                <span className="text-sm font-medium text-gray-900">{item.label}</span>
                <span className="text-sm text-gray-500 ml-2">({item.level})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
