
import { Button } from "@/components/ui/button";

interface MatchFilterProps {
  selectedFilter: 'all' | 'finished' | 'upcoming';
  onFilterChange: (filter: 'all' | 'finished' | 'upcoming') => void;
}

const MatchFilter = ({ selectedFilter, onFilterChange }: MatchFilterProps) => {
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'finished', label: 'Finished' },
    { key: 'upcoming', label: 'Upcoming' }
  ] as const;

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant={selectedFilter === filter.key ? "default" : "outline"}
          onClick={() => onFilterChange(filter.key)}
          className={`whitespace-nowrap ${
            selectedFilter === filter.key 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};

export default MatchFilter;
