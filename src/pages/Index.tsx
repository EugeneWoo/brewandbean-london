import { useState, useMemo } from "react";
import { CoffeeMap } from "@/components/CoffeeMap";
import { FilterBar } from "@/components/FilterBar";
import { LocationBar } from "@/components/LocationBar";
import { AppHeader } from "@/components/AppHeader";
import { coffeeShops } from "@/data/coffeeShops";
import { useUserLocation } from "@/hooks/useUserLocation";

const Index = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const locationState = useUserLocation();

  const filteredShops = useMemo(() => {
    if (activeFilters.length === 0) return coffeeShops;
    return coffeeShops.filter((shop) =>
      activeFilters.every((f) => shop.attributes[f as keyof typeof shop.attributes])
    );
  }, [activeFilters]);

  const toggleFilter = (key: string) => {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <AppHeader />
      <FilterBar
        activeFilters={activeFilters}
        onToggleFilter={toggleFilter}
        onClearAll={() => setActiveFilters([])}
        matchCount={filteredShops.length}
        totalCount={coffeeShops.length}
      />
      <div className="flex-1 relative">
        <LocationBar locationState={locationState} />
        <CoffeeMap
          filteredShops={filteredShops}
          selectedShop={selectedShop}
          onSelectShop={setSelectedShop}
          userLocation={locationState.location}
        />
      </div>
    </div>
  );
};

export default Index;
