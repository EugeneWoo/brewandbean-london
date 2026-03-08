import { useState, useMemo } from "react";
import { CoffeeMap } from "@/components/CoffeeMap";
import { FilterBar } from "@/components/FilterBar";
import { LocationBar } from "@/components/LocationBar";
import { AppHeader } from "@/components/AppHeader";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useNearbyShops } from "@/hooks/useNearbyShops";
import { useAllShops } from "@/hooks/useAllShops";

const Index = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const locationState = useUserLocation();
  const { shops: nearbyShops, loading: nearbyLoading } = useNearbyShops(locationState.location);

  const allShops = useAllShops(nearbyShops, locationState.location);

  const filteredShops = useMemo(() => {
    if (activeFilters.length === 0) return allShops;
    return allShops.filter((shop) =>
      activeFilters.every((f) => {
        if (f === "openNow") return shop.isOpen;
        return shop.attributes[f as keyof typeof shop.attributes];
      })
    );
  }, [activeFilters, allShops]);

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
        totalCount={allShops.length}
      />
      <div className="flex-1 relative">
        <LocationBar locationState={locationState} />
        {nearbyLoading && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-[1000] bg-background/90 backdrop-blur px-3 py-1.5 rounded-full text-xs text-muted-foreground shadow-sm border border-border">
            Loading nearby shops…
          </div>
        )}
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
