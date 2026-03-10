import { useState, useEffect, useCallback, useRef } from "react";
import { coffeeShops } from "@/data/coffeeShops";

export interface UserLocation {
  lat: number;
  lng: number;
  source: "geolocation" | "manual";
}

export interface LocationState {
  location: UserLocation | null;
  nearestNeighborhood: string | null;
  nearbyCount: number;
  status: "loading" | "granted" | "denied" | "manual";
  error: string | null;
  setManualLocation: (lat: number, lng: number) => void;
  retry: () => void;
}

/** Walking distance in km (~10 min walk ≈ 0.8km) */
const NEARBY_RADIUS_KM = 1.2;

/** Haversine distance in km */
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestNeighborhood(lat: number, lng: number): string {
  let nearest = coffeeShops[0];
  let minDist = Infinity;
  for (const shop of coffeeShops) {
    const d = distanceKm(lat, lng, shop.lat, shop.lng);
    if (d < minDist) {
      minDist = d;
      nearest = shop;
    }
  }
  return nearest.neighborhood;
}

function countNearby(lat: number, lng: number): number {
  return coffeeShops.filter(
    (shop) => distanceKm(lat, lng, shop.lat, shop.lng) <= NEARBY_RADIUS_KM
  ).length;
}

const CACHE_KEY = "bb_user_location";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCachedLocation(): { location: UserLocation; status: LocationState["status"] } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return { location: cached.location, status: cached.status };
  } catch {
    return null;
  }
}

function setCachedLocation(location: UserLocation, status: LocationState["status"]) {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ location, status, timestamp: Date.now() }));
}

export function useUserLocation(): LocationState {
  const cached = getCachedLocation();
  const [location, setLocation] = useState<UserLocation | null>(cached?.location ?? null);
  const [status, setStatus] = useState<LocationState["status"]>(cached?.status ?? "loading");
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("denied");
      setError("Geolocation not supported");
      return;
    }

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setStatus("loading");

    const onPosition = (pos: GeolocationPosition) => {
      const loc: UserLocation = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        source: "geolocation",
      };
      setLocation(loc);
      setStatus("granted");
      setCachedLocation(loc, "granted");
      setError(null);
    };

    const onError = (err: GeolocationPositionError) => {
      console.log("[Location] Error:", err.code, err.message);
      setStatus("denied");
      setError(
        err.code === 1
          ? "Location permission denied. Please enable Location Services in Safari Settings."
          : "Could not determine location"
      );
    };

    // First: getCurrentPosition for a fast initial snap (uses network/wifi location, no GPS warm-up wait)
    navigator.geolocation.getCurrentPosition(onPosition, onError, {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 300000, // accept up to 5min old cached position for instant snap
    });

    // Then: watchPosition for ongoing accurate updates
    watchIdRef.current = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000,
    });
  }, []);

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Auto-request geolocation on mount if no cached location
  useEffect(() => {
    if (!cached) {
      requestGeolocation();
    }
    // Safety net: if still loading after 8s (e.g. geolocation blocked in iframe/preview),
    // downgrade to "denied" so the City of London fallback kicks in
    const timeout = setTimeout(() => {
      setStatus((prev) => (prev === "loading" ? "denied" : prev));
    }, 8000);
    return () => clearTimeout(timeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setManualLocation = useCallback((lat: number, lng: number) => {
    const loc: UserLocation = { lat, lng, source: "manual" };
    setLocation(loc);
    setStatus("manual");
    setCachedLocation(loc, "manual");
    setError(null);
  }, []);

  const nearestNeighborhood = location
    ? findNearestNeighborhood(location.lat, location.lng)
    : null;

  const nearbyCount = location
    ? countNearby(location.lat, location.lng)
    : 0;

  return {
    location,
    nearestNeighborhood,
    nearbyCount,
    status,
    error,
    setManualLocation,
    retry: requestGeolocation,
  };
}
