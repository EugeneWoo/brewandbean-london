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

export function useUserLocation(): LocationState {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<LocationState["status"]>("loading");
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

    // First try a quick low-accuracy position, then upgrade to watch
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("[Location] Quick fix:", pos.coords.latitude, pos.coords.longitude);
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          source: "geolocation",
        });
        setStatus("granted");
        setError(null);
      },
      (err) => {
        console.log("[Location] Quick fix failed:", err.code, err.message);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    );

    // Then use watchPosition for live high-accuracy updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        console.log("[Location] Watch update:", pos.coords.latitude, pos.coords.longitude, "accuracy:", pos.coords.accuracy);
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          source: "geolocation",
        });
        setStatus("granted");
        setError(null);
      },
      (err) => {
        console.log("[Location] Watch error:", err.code, err.message);
        setStatus("denied");
        setError(
          err.code === 1
            ? "Location permission denied"
            : "Could not determine location"
        );
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    requestGeolocation();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [requestGeolocation]);

  const setManualLocation = useCallback((lat: number, lng: number) => {
    setLocation({ lat, lng, source: "manual" });
    setStatus("manual");
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
