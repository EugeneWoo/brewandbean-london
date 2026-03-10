import { useMemo } from "react";
import { coffeeShops, isIndependentVerified } from "@/data/coffeeShops";
import type { CoffeeShop } from "@/data/coffeeShops";
import type { UserLocation } from "@/hooks/useUserLocation";


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

/**
 * Single source of truth for the shop list used by both Map and List views.
 * Merges hardcoded curated shops with Google Places API results,
 * deduplicates by name and proximity, and filters for quality.
 */
const CITY_OF_LONDON: [number, number] = [51.515, -0.09];

export function useAllShops(
  nearbyShops: CoffeeShop[],
  userLocation: UserLocation | null,
  locationStatus: "loading" | "granted" | "denied" | "manual"
): CoffeeShop[] {
  return useMemo(() => {
    // While locating, show nothing — wait for real location
    if (locationStatus === "loading") return [];

    // Denied with no location: fall back to City of London as last resort
    const userLat = userLocation?.lat ?? CITY_OF_LONDON[0];
    const userLng = userLocation?.lng ?? CITY_OF_LONDON[1];

    // 1. Quality-filter hardcoded shops within 3km (matching API radius)
    const qualityHardcoded = coffeeShops.filter(
      (s) =>
        isIndependentVerified(s) &&
        s.verification.googleRating >= 4.5 &&
        haversineKm(userLat, userLng, s.lat, s.lng) <= 3
    );
    console.log(`[AllShops] total=${coffeeShops.length} qualityHardcoded=${qualityHardcoded.length} nearbyShops=${nearbyShops.length} lat=${userLat.toFixed(4)} lng=${userLng.toFixed(4)}`);

    // 2. Merge with API shops (dedupe by name)
    let merged = qualityHardcoded;
    if (nearbyShops.length > 0) {
      const hardcodedNames = new Set(
        qualityHardcoded.map((s) => s.name.toLowerCase().trim())
      );
      const newShops = nearbyShops.filter(
        (s) => !hardcodedNames.has(s.name.toLowerCase().trim())
      );
      merged = [...qualityHardcoded, ...newShops];
    }

    console.log(`[AllShops] merged=${merged.length} names=${merged.map(s=>s.name).join(', ')}`);
    return merged;
  }, [nearbyShops, userLocation?.lat, userLocation?.lng, locationStatus]);
}
