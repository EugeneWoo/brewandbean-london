# Brew & Bean London — CLAUDE.md

## Project Overview
A React SPA for discovering independent specialty coffee shops in London, combining Google Places API data with curated Reddit community reviews layered onto an interactive map.

## Tech Stack

**Frontend:** React 18, TypeScript, Vite (port 8080), React Router
**Design System:** shadcn/ui (Radix UI primitives) + Tailwind CSS with custom HSL CSS variables, DM Serif Display (headings) / DM Sans (body), light/dark mode via `next-themes`
**Maps:** Leaflet + react-leaflet with OpenStreetMap tiles — custom ☕ pin markers with rating badges and purple Reddit buzz indicators
**Animations:** Framer Motion
**Forms:** React Hook Form
**Testing:** Vitest + jsdom

## Backend

**Supabase Edge Function** (`supabase/functions/fetch-nearby-shops/`):
- Deno/TypeScript function proxying Google Places Nearby Search API
- In-memory grid-based cache (30-min TTL, keyed by grid cell + radius), filters to **≥4.4 rating** within **3km**
- Name-based exclusion list (`EXCLUDED_NAMES`) filters chains, restaurants, diners, food-first venues — only coffee-first indie shops pass
- `NON_STANDALONE_TYPES` exclusion list drops venues Google tags as bar, pub, restaurant, hotel, etc. (this is why pub-cafés like The Fallow Deer never appear in the API feed and must be added as curated entries)
- Photo proxy sub-route (`/photo`) served through the same function
- JWT verification disabled (public access)
- Env vars required: `GOOGLE_MAPS_API_KEY`, `SUPABASE_URL`
- **Deployment:** Must be manually redeployed via Supabase Dashboard to pick up code changes (no CLI on free tier)

**No database** — Supabase is used only for Edge Function hosting.

## Data Architecture

| Source | Location | Description |
|--------|----------|-------------|
| Curated shops | `src/data/shops.ts` | 50+ hand-picked London shops with metadata |
| Reddit reviews | `src/data/redditReviews.ts` | Pre-scraped quotes from r/Coffee, r/london, r/pourover, r/JamesHoffmann |
| Live data | Edge Function → Google Places | Real-time nearby results merged with curated data |

## Location & Map Behaviour
- **Radius:** 3km for both Google Places API (`useNearbyShops`) and curated shop filter (`useAllShops`)
- **Merge logic** (`useAllShops`):
  1. Curated shops (`shops.ts`) within 3km that pass `isIndependentVerified` are always included — **no rating gate** (hand-picked entries are trusted regardless of score)
  2. Google Places API results (already filtered to ≥4.4 by the Edge Function) are appended for any name not already present in the curated set (case-insensitive dedup)
  - Venues excluded from the API feed by type (pubs, bars, etc.) must be added manually to `shops.ts` to appear
- **`isIndependentVerified`** (`src/data/coffeeShops.ts`): a shop passes if ALL of the following hold:
  - Name does not match any entry in `EXCLUDED_CHAINS` (Costa, Starbucks, Caffe Nero, Gail's, Blank Street, Pret, Greggs, Coffee Republic, Wild Bean Cafe, Black Sheep)
  - Name does not match any entry in `EXCLUDED_BAKERIES` (Ole & Steen, Paul, Cornish Bakehouse)
  - `verification.totalLocations` ≤ 5
  - `verification.googleRating` ≥ 4.0
  - `hasFullInfo` is **not** a gate — all indie shops show regardless
- **Map snap** (`MapLocationSnap` in `CoffeeMap`): fires on every location change (GPS, postcode, dropdown) — always snaps and fits bounds to nearby shops within 2km, no debounce
- **Location sources:** GPS (`granted`), manual postcode lookup via postcodes.io, dropdown area presets. Session-cached for 10 min
- **Fallback:** City of London if location denied

## Reddit × Google Maps Layering
- `src/hooks/useNearbyShops.ts` calls the Edge Function for live Google Places results
- Results are merged with local `shops.ts` curated data
- `src/data/redditReviews.ts` maps Reddit mentions to shop IDs
- Map pins show a purple buzz dot when a shop has Reddit community discussion
- `ShopRedditReviews.tsx` renders quotes, scores, and thread links on shop profiles

## Key Directories
```
src/
  components/      # AppHeader, CoffeeMap, FilterBar, NearbyShopCard, ShopPreviewCard
  components/shop/ # ShopHero, ShopFeatures, ShopPhotos, ShopRedditReviews, ShopTransport
  components/ui/   # shadcn/ui primitives (50+ files)
  pages/           # Index (map), NearbyList, ShopProfile, NotFound
  hooks/           # useNearbyShops, useUserLocation, useAllShops, use-mobile
  data/            # shops.ts, redditReviews.ts, coffeeShops.ts (types + chain filters)
  integrations/supabase/ # client.ts, types.ts
supabase/functions/fetch-nearby-shops/index.ts
```

## Environment Variables
```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
# Edge Function (Supabase dashboard secrets):
GOOGLE_MAPS_API_KEY
```

## Commands
```bash
npm run dev      # Dev server on port 8080
npm run build    # Production build → /dist
npm run test     # Vitest (run once)
```
