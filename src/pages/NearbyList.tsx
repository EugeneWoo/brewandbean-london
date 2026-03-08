import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FilterBar } from "@/components/FilterBar";
import { AppHeader } from "@/components/AppHeader";
import { LocationBar } from "@/components/LocationBar";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useNearbyShops } from "@/hooks/useNearbyShops";
import { useAllShops } from "@/hooks/useAllShops";
import { NearbyShopCard } from "@/components/NearbyShopCard";
import { Loader2 } from "lucide-react";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function rankScore(distKm: number, rating: number): number {
  const distNorm = Math.min(distKm / 5, 1);
  const ratingNorm = 1 - (rating - 4) / 1.5;
  return distNorm * 0.6 + ratingNorm * 0.4;
}

const NearbyList = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const locationState = useUserLocation();
  const { shops: nearbyShops, loading: nearbyLoading } = useNearbyShops(locationState.location);
  const navigate = useNavigate();

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

  const rankedShops = useMemo(() => {
    const userLat = locationState.location?.lat ?? 51.515;
    const userLng = locationState.location?.lng ?? -0.09;

    return [...filteredShops]
      .map((shop) => ({
        shop,
        distance: haversineKm(userLat, userLng, shop.lat, shop.lng),
      }))
      .sort((a, b) => rankScore(a.distance, a.shop.verification.googleRating) - rankScore(b.distance, b.shop.verification.googleRating))
      .slice(0, 10);
  }, [filteredShops, locationState.location]);

  const toggleFilter = (key: string) => {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <FilterBar
        activeFilters={activeFilters}
        onToggleFilter={toggleFilter}
        onClearAll={() => setActiveFilters([])}
        matchCount={filteredShops.length}
        totalCount={allShops.length}
      />
      <LocationBar locationState={locationState} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
          <h1 className="font-heading text-xl text-foreground">
            Nearest Coffee Shops
          </h1>

          {nearbyLoading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Finding nearby shops…</span>
            </div>
          )}

          {!nearbyLoading && rankedShops.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No shops match your filters nearby.
            </p>
          )}

          {rankedShops.map(({ shop, distance }, idx) => (
            <NearbyShopCard
              key={shop.id}
              shop={shop}
              rank={idx + 1}
              distanceKm={distance}
              onClick={() => navigate(`/shop/${shop.id}`, { state: { shop } })}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NearbyList;
