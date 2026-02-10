import { cn } from '@/lib/utils';

interface FilterTab {
  id: string;
  label: string;
}

interface FilterTabsProps {
  activeFilter?: string;
  onFilterChange?: (filterId: string) => void;
}

export const FilterTabs = ({ activeFilter = 'all', onFilterChange }: FilterTabsProps) => {
  const filterTabs: FilterTab[] = [
    { id: 'all', label: 'ALL' },
    { id: 'live', label: 'LIVE' },
    { id: 'finished', label: 'FINISHED' },
    { id: 'scheduled', label: 'SCHEDULED' },
  ];

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-6 px-6 mb-4">
      <div className="flex items-center gap-3 min-w-max">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onFilterChange?.(tab.id)}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-md transition-all whitespace-nowrap",
              activeFilter === tab.id
                ? "bg-[#ff2957] text-white shadow-lg shadow-[#ff2957]/30"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
