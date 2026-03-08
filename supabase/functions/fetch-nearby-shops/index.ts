import { corsHeaders } from "../_shared/cors.ts";

// Simple in-memory cache keyed by grid cell (~500m)
const cache = new Map<string, { data: any[]; ts: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function gridKey(lat: number, lng: number): string {
  // ~500m grid cells
  return `${(lat * 200).toFixed(0)},${(lng * 200).toFixed(0)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, radius = 1500 } = await req.json();

    if (!lat || !lng) {
      return new Response(JSON.stringify({ error: "lat and lng required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = gridKey(lat, lng);
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return new Response(JSON.stringify({ shops: cached.data, source: "cache" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Google Maps API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Google Places Nearby Search
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", String(radius));
    url.searchParams.set("type", "cafe");
    url.searchParams.set("keyword", "coffee");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Places API error:", data.status, data.error_message);
      return new Response(JSON.stringify({ error: `Places API: ${data.status}`, detail: data.error_message }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const shops = (data.results || []).map((place: any) => ({
      id: `gp-${place.place_id}`,
      name: place.name,
      address: place.vicinity || "",
      neighborhood: "",
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      image: place.photos?.[0]
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${place.photos[0].photo_reference}&key=${apiKey}`
        : "",
      photos: (place.photos || []).slice(0, 3).map(
        (p: any) =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${p.photo_reference}&key=${apiKey}`
      ),
      roaster: "",
      phone: "",
      website: "",
      instagram: "",
      isOpen: place.opening_hours?.open_now ?? false,
      hours: {},
      attributes: {
        kidsFriendly: false,
        laptopFriendly: false,
        sitIn: true,
        foodMenu: false,
        opensEarly: false,
        opensLate: false,
        specialtyCoffee: false,
        dogFriendly: false,
      },
      communityReview: "",
      sentimentTags: [],
      nearestTransport: [],
      verification: {
        totalLocations: 1,
        googleRating: place.rating || 0,
        hasFullInfo: false,
      },
      placeId: place.place_id,
      totalRatings: place.user_ratings_total || 0,
      priceLevel: place.price_level,
      source: "google_places" as const,
    }));

    cache.set(key, { data: shops, ts: Date.now() });

    return new Response(JSON.stringify({ shops, source: "api" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
