'use client';

interface ToggleOption<T extends string> {
  value: T;
  label: string;
}

interface ToggleGroupProps<T extends string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: ToggleGroupProps<T>) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-sm text-gray-600">{label}</span>
      )}
      <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md transition-colors
              ${
                value === option.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }
            `}
            aria-pressed={value === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
