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

    console.log(`[NearbyShops] Fetching for key=${key} lat=${userLocation.lat} lng=${userLocation.lng}`);

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const url = `${SUPABASE_URL}/functions/v1/fetch-nearby-shops`;
        console.log(`[NearbyShops] POST ${url}`);

        const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": SUPABASE_ANON_KEY,
              "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ lat: userLocation.lat, lng: userLocation.lng, radius: 2000 }),
          }
        );

        if (cancelled) return;

        console.log(`[NearbyShops] Response status: ${res.status}`);

        if (!res.ok) {
          const text = await res.text();
          console.error(`[NearbyShops] HTTP error ${res.status}:`, text);
          setError(`API error ${res.status}`);
          setLoading(false);
          return;
        }

        const data = await res.json();
        console.log(`[NearbyShops] Got ${data.shops?.length ?? 0} shops, source=${data.source}`);
        lastFetchKey.current = key;
        setShops(data.shops || []);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          console.error("[NearbyShops] Exception:", err);
          setError(String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userLocation?.lat, userLocation?.lng]);

  return { shops, loading, error };
}
