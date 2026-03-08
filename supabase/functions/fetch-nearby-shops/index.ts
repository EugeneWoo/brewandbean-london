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

    // Google Places Nearby Search (New API)
    const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.photos,places.currentOpeningHours,places.priceLevel",
      },
      body: JSON.stringify({
        includedTypes: ["cafe", "coffee_shop"],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: Number(radius),
          },
        },
      }),
    });

    const data = await res.json();

    if (data.error) {
      console.error("Places API error:", data.error.status, data.error.message);
      return new Response(JSON.stringify({ error: `Places API: ${data.error.status}`, detail: data.error.message }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const shops = (data.places || []).map((place: any) => {
      const photoUri = place.photos?.[0]?.name
        ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxWidthPx=600&key=${apiKey}`
        : "";
      return {
        id: `gp-${place.id}`,
        name: place.displayName?.text || "",
        address: place.formattedAddress || "",
        neighborhood: "",
        lat: place.location?.latitude || 0,
        lng: place.location?.longitude || 0,
        image: photoUri,
        photos: (place.photos || []).slice(0, 3).map(
          (p: any) => `https://places.googleapis.com/v1/${p.name}/media?maxWidthPx=600&key=${apiKey}`
        ),
        roaster: "",
        phone: "",
        website: "",
        instagram: "",
        isOpen: place.currentOpeningHours?.openNow ?? false,
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
        placeId: place.id,
        totalRatings: place.userRatingCount || 0,
        priceLevel: place.priceLevel,
        source: "google_places" as const,
      };
    });

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
