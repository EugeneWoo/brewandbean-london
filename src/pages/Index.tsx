import { useState, useMemo } from "react";
import { isIndependentVerified } from "@/data/coffeeShops";
import { CoffeeMap } from "@/components/CoffeeMap";
import { FilterBar } from "@/components/FilterBar";
import { LocationBar } from "@/components/LocationBar";
import { AppHeader } from "@/components/AppHeader";
import { coffeeShops } from "@/data/coffeeShops";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useNearbyShops } from "@/hooks/useNearbyShops";

const Index = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const locationState = useUserLocation();
  const { shops: nearbyShops, loading: nearbyLoading } = useNearbyShops(locationState.location);

  // Merge hardcoded + API shops, filtering to verified 4.5+ only
  const allShops = useMemo(() => {
    // Filter hardcoded: must be verified and rating >= 4.5
    const qualityHardcoded = coffeeShops.filter(
      (s) => isIndependentVerified(s) && s.verification.googleRating >= 4.5
    );

    if (nearbyShops.length === 0) return qualityHardcoded;

    const hardcodedNames = new Set(
      qualityHardcoded.map((s) => s.name.toLowerCase().trim())
    );

    // API shops already filtered to 4.5+ in edge function
    const newShops = nearbyShops.filter(
      (s) => !hardcodedNames.has(s.name.toLowerCase().trim())
    );

    return [...qualityHardcoded, ...newShops];
  }, [nearbyShops]);

  const filteredShops = useMemo(() => {
    if (activeFilters.length === 0) return allShops;
    return allShops.filter((shop) =>
      activeFilters.every((f) => shop.attributes[f as keyof typeof shop.attributes])
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
