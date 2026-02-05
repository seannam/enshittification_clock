interface ClockFaceProps {
  level: number; // 0-100
  color: string; // 'green', 'yellow', 'orange', 'red', 'darkred'
}

const colorMap: Record<string, string> = {
  green: 'var(--clock-green)',
  yellow: 'var(--clock-yellow)',
  orange: 'var(--clock-orange)',
  red: 'var(--clock-red)',
  darkred: 'var(--clock-darkred)',
};

export function ClockFace({ level, color }: ClockFaceProps) {
  // Convert level (0-100) to degrees (0-360)
  // 0 = 12 o'clock (270 degrees in SVG), 100 = just before 12 o'clock (full rotation)
  const rotation = (level / 100) * 360 - 90; // -90 to start at 12 o'clock

  const strokeColor = colorMap[color] || colorMap.green;

  return (
    <div className="relative w-full h-full max-w-2xl mx-auto flex items-center justify-center" aria-label="Enshittification Clock">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full max-h-full aspect-square"
        role="img"
        aria-label={`Enshittification level: ${level} out of 100`}
      >
        {/* Clock face circle */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="white"
          stroke="#e5e7eb"
          strokeWidth="2"
          className="drop-shadow-lg"
        />

        {/* Hour markers */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const innerRadius = 75;
          const outerRadius = 85;
          const x1 = 100 + innerRadius * Math.sin(angle);
          const y1 = 100 - innerRadius * Math.cos(angle);
          const x2 = 100 + outerRadius * Math.sin(angle);
          const y2 = 100 - outerRadius * Math.cos(angle);

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}

        {/* Center dot */}
        <circle cx="100" cy="100" r="5" fill="#374151" />

        {/* Clock hand */}
        <g transform={`rotate(${rotation} 100 100)`}>
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
          {/* Arrow tip */}
          <polygon
            points="100,25 95,35 105,35"
            fill={strokeColor}
            className="transition-all duration-700 ease-out"
          />
        </g>

        {/* Level indicator text */}
        <text
          x="100"
          y="140"
          textAnchor="middle"
          fontSize="24"
          fontWeight="bold"
          fill={strokeColor}
          className="transition-all duration-700 ease-out"
        >
          {level}
        </text>
        <text
          x="100"
          y="155"
          textAnchor="middle"
          fontSize="12"
          fill="#6b7280"
          className="uppercase tracking-wide"
        >
          / 100
        </text>
      </svg>
    </div>
  );
}
