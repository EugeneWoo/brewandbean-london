import { corsHeaders } from "../_shared/cors.ts";

// Simple in-memory cache keyed by grid cell (~500m)
const cache = new Map<string, { data: any[]; ts: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Names to filter out (case-insensitive partial match)
const EXCLUDED_NAMES = [
  "hotel", "hostel", "library", "school", "university", "college",
  "gas station", "petrol", "supermarket", "marks & spencer", "m&s",
  "tesco", "sainsbury", "waitrose", "aldi", "lidl", "co-op",
  "premier inn", "travelodge", "holiday inn",
  // Non-coffee themed shops
  "chaii", "chai ", "chaiiwala", "bubble tea", "boba",
  "turkish tea", "shisha", "hookah",
  "asian dessert", "dessert bar", "ice cream",
  "juice bar", "smoothie", "açaí",
  // National chains
  "costa coffee", "costa", "caffe nero", "caffè nero", "nero",
  "starbucks", "pret a manger", "pret ", "greggs",
  "gail's", "gails", "blank street", "black sheep",
  "coffee republic", "wild bean cafe",
];

function gridKey(lat: number, lng: number): string {
  return `${(lat * 200).toFixed(0)},${(lng * 200).toFixed(0)}`;
}

function isLikelyCoffeeShop(name: string): boolean {
  const lower = name.toLowerCase();
  return !EXCLUDED_NAMES.some((ex) => lower.includes(ex));
}

// Encode photo ref as base64url so the proxy endpoint can decode it
function encodePhotoRef(photoName: string): string {
  // Use btoa-safe encoding
  return btoa(photoName).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  // Photo proxy: GET /fetch-nearby-shops/photo?ref=<encoded>
  if (req.method === "GET" && pathParts[pathParts.length - 1] === "photo") {
    const ref = url.searchParams.get("ref");
    if (!ref) {
      return new Response("Missing ref", { status: 400, headers: corsHeaders });
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      return new Response("No API key", { status: 500, headers: corsHeaders });
    }

    try {
      // Decode the photo name
      const padded = ref.replace(/-/g, "+").replace(/_/g, "/");
      const photoName = atob(padded);
      const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=600&key=${apiKey}`;

      const photoRes = await fetch(photoUrl, { redirect: "follow" });
      const body = await photoRes.arrayBuffer();

      return new Response(body, {
        headers: {
          ...corsHeaders,
          "Content-Type": photoRes.headers.get("Content-Type") || "image/jpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch (err) {
      console.error("Photo proxy error:", err);
      return new Response("Photo fetch failed", { status: 502, headers: corsHeaders });
    }
  }

  // Main nearby search
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const photoProxyBase = `${supabaseUrl}/functions/v1/fetch-nearby-shops/photo`;

    // Google Places Nearby Search (New API)
    const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.photos,places.currentOpeningHours,places.priceLevel,places.types",
      },
      body: JSON.stringify({
        includedTypes: ["cafe", "coffee_shop"],
        excludedTypes: ["hotel", "lodging", "school", "university", "library", "gas_station", "supermarket", "grocery_store"],
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

    const shops = (data.places || [])
      .filter((place: any) => {
        if (!isLikelyCoffeeShop(place.displayName?.text || "")) return false;
        // Require minimum 4.5 rating
        if ((place.rating || 0) < 4.5) return false;
        return true;
      })
      .map((place: any) => {
        const makeProxyUrl = (photoName: string) =>
          `${photoProxyBase}?ref=${encodePhotoRef(photoName)}`;

        const image = place.photos?.[0]?.name
          ? makeProxyUrl(place.photos[0].name)
          : "";

        return {
          id: `gp-${place.id}`,
          name: place.displayName?.text || "",
          address: place.formattedAddress || "",
          neighborhood: "",
          lat: place.location?.latitude || 0,
          lng: place.location?.longitude || 0,
          image,
          photos: (place.photos || []).slice(0, 3).map(
            (p: any) => makeProxyUrl(p.name)
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
