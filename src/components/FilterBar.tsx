import { Button } from "@/components/ui/button";
import {
  Users,
  Armchair,
  UtensilsCrossed,
  Sunrise,
  Moon,
  Dog,
  X,
  Clock,
} from "lucide-react";

export interface FilterOption {
  key: string;
  label: string;
  icon: React.ReactNode;
}

export const filterOptions: FilterOption[] = [
  { key: "openNow", label: "Open Now", icon: <Clock className="h-4 w-4" /> },
  { key: "kidsFriendly", label: "Kids Friendly", icon: <Users className="h-4 w-4" /> },
  { key: "sitIn", label: "Sit-in Space", icon: <Armchair className="h-4 w-4" /> },
  { key: "foodMenu", label: "Food Menu", icon: <UtensilsCrossed className="h-4 w-4" /> },
  { key: "opensEarly", label: "Opens Early", icon: <Sunrise className="h-4 w-4" /> },
  { key: "opensLate", label: "Opens Late", icon: <Moon className="h-4 w-4" /> },
  { key: "dogFriendly", label: "Dog Friendly", icon: <Dog className="h-4 w-4" /> },
];

interface FilterBarProps {
  activeFilters: string[];
  onToggleFilter: (key: string) => void;
  onClearAll: () => void;
  matchCount: number;
  totalCount: number;
}

export function FilterBar({ activeFilters, onToggleFilter, onClearAll, matchCount, totalCount }: FilterBarProps) {
  const hasFilters = activeFilters.length > 0;

  return (
    <div className="bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 space-y-2">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filterOptions.map((filter) => {
          const isActive = activeFilters.includes(filter.key);
          return (
            <Button
              key={filter.key}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={`shrink-0 rounded-full gap-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "bg-card hover:bg-secondary"
              }`}
              onClick={() => onToggleFilter(filter.key)}
            >
              {filter.icon}
              {filter.label}
            </Button>
          );
        })}
      </div>
      {hasFilters && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">
            {matchCount} of {totalCount} shops match
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-muted-foreground hover:text-foreground gap-1"
            onClick={onClearAll}
          >
            <X className="h-3 w-3" />
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
