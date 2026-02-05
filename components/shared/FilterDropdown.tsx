'use client';

interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface FilterDropdownProps<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

export function FilterDropdown<T extends string>({
  options,
  value,
  onChange,
  label,
}: FilterDropdownProps<T>) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <label className="text-sm text-gray-600">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="
          px-3 py-1.5 text-sm font-medium
          bg-white border border-gray-200 rounded-lg
          text-gray-900
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          cursor-pointer
        "
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
