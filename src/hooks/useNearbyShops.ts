import { useState, useEffect, useRef } from "react";
import type { CoffeeShop } from "@/data/coffeeShops";
import type { UserLocation } from "@/hooks/useUserLocation";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

interface UseNearbyShopsResult {
  shops: CoffeeShop[];
  loading: boolean;
  error: string | null;
}

export function useNearbyShops(userLocation: UserLocation | null): UseNearbyShopsResult {
  const [shops, setShops] = useState<CoffeeShop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchKey = useRef<string>("");

  useEffect(() => {
    if (!userLocation) return;

    // Grid key to avoid refetching for tiny movements (~500m)
    const key = `${(userLocation.lat * 200).toFixed(0)},${(userLocation.lng * 200).toFixed(0)}`;
    if (key === lastFetchKey.current) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/fetch-nearby-shops`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": SUPABASE_ANON_KEY,
              "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ lat: userLocation.lat, lng: userLocation.lng, radius: 1500 }),
          }
        );

        if (cancelled) return;

        if (!res.ok) {
          console.error("fetch-nearby-shops HTTP error:", res.status);
          setError("Could not load nearby shops");
          setLoading(false);
          return;
        }

        const data = await res.json();
        lastFetchKey.current = key;
        setShops(data.shops || []);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          console.error("fetch-nearby-shops exception:", err);
          setError("Could not load nearby shops");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userLocation?.lat, userLocation?.lng]);

  return { shops, loading, error };
}
