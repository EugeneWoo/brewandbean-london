import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CoffeeShop } from "@/data/coffeeShops";
import type { UserLocation } from "@/hooks/useUserLocation";

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
        const { data, error: fnError } = await supabase.functions.invoke("fetch-nearby-shops", {
          body: { lat: userLocation.lat, lng: userLocation.lng, radius: 1500 },
        });

        if (cancelled) return;

        if (fnError) {
          console.error("fetch-nearby-shops error:", fnError);
          setError("Could not load nearby shops");
          setLoading(false);
          return;
        }

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
