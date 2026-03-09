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
- In-memory grid-based cache (30-min TTL), filters to 4.5+ rated independent shops within 1500m
- Photo proxy sub-route (`/photo`) served through the same function
- JWT verification disabled (public access)
- Env vars required: `GOOGLE_MAPS_API_KEY`, `SUPABASE_URL`

**No database** — Supabase is used only for Edge Function hosting.

## Data Architecture

| Source | Location | Description |
|--------|----------|-------------|
| Curated shops | `src/data/shops.ts` | 50+ hand-picked London shops with metadata |
| Reddit reviews | `src/data/redditReviews.ts` | Pre-scraped quotes from r/Coffee, r/london, r/pourover, r/JamesHoffmann |
| Live data | Edge Function → Google Places | Real-time nearby results merged with curated data |

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
