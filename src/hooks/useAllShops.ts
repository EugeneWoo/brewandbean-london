import { useMemo } from "react";
import { coffeeShops, isIndependentVerified } from "@/data/coffeeShops";
import type { CoffeeShop } from "@/data/coffeeShops";
import type { UserLocation } from "@/hooks/useUserLocation";


const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function computeIsOpen(hours: Record<string, string>): boolean {
  const now = new Date();
  const todayHours = hours[DAYS[now.getDay()]];
  if (!todayHours || todayHours === "Closed") return false;
  const parts = todayHours.split("–"); // en-dash U+2013
  if (parts.length !== 2) return false;
  const [openH, openM] = parts[0].split(":").map(Number);
  const [closeH, closeM] = parts[1].split(":").map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return nowMins >= openH * 60 + openM && nowMins < closeH * 60 + closeM;
}

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

    // 1. Filter hardcoded shops within 3km — curated entries bypass rating gate (hand-picked)
    const qualityHardcoded = coffeeShops
      .filter(
        (s) =>
          isIndependentVerified(s) &&
          haversineKm(userLat, userLng, s.lat, s.lng) <= 3
      )
      .map((s) => ({ ...s, isOpen: computeIsOpen(s.hours) }));
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
