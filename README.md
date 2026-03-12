# Brew & Bean London

A location-based web app for discovering independent specialty coffee shops in London. Find the best independent cafes near you, filtered by your preferences, with community reviews and real-time data.

## Features

- **Interactive Map** — Leaflet map with coffee shop markers, Reddit buzz indicators, and live user location
- **Location Services** — Browser geolocation with live tracking, manual location fallback, and walking distance calculation (~1.2km radius)
- **Shop Filters** — Open Now, Kids Friendly, Sit-in Space, Food Menu, Opens Early/Late, Dog Friendly
- **Two Views** — Map view for exploration, list view ranked by distance + rating
- **Shop Profiles** — Full details including hours, photos, transport links, and Reddit community reviews
- **Curated + Live Data** — ~50 hand-picked independent London shops always shown within 3km; real-time Google Places results (≥4.4 rating) appended for any shop not already in the curated set

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- **Maps:** Leaflet + react-leaflet with OpenStreetMap tiles
- **Backend:** Supabase Edge Functions (Google Places API proxy only — no database)
- **Data:** Local TypeScript data files (curated shops, Reddit reviews), Google Places API via Edge Function

## Getting Started

**Prerequisites:** Node.js + npm

```sh
# Install dependencies
npm install

# Start development server (http://localhost:8080)
npm run dev
```

### Environment Variables

The app uses a Supabase Edge Function as a proxy to the Google Places API. Create a `.env` file:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
VITE_SUPABASE_PROJECT_ID=<your-project-id>
```

> Note: Supabase is used solely to host the `fetch-nearby-shops` Edge Function. There is no database — all shop data is stored in local TypeScript files.

### Other Commands

```sh
npm run build      # Production build
npm run preview    # Preview production build
npm test           # Run tests (Vitest)
npm run lint       # Run ESLint
```

## Project Structure

```
src/
├── components/       # React components (map, filters, cards, shop profile)
├── pages/            # Route pages (Home, NearbyList, ShopProfile, NotFound)
├── hooks/            # Custom hooks (location, shop data, filters)
├── data/             # Curated shop data and Reddit reviews
└── integrations/     # Supabase client and types

supabase/
└── functions/
    └── fetch-nearby-shops/   # Google Places API wrapper with caching & deduplication
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Map view with nearby shops |
| `/nearby` | List view of top 10 nearest shops |
| `/shop/:id` | Individual shop profile |

## Data Sources

- **Curated shops** (`src/data/shops.ts`) — ~50 hand-picked independent London coffee shops with full metadata (hours, photos, transport, Reddit reviews). Always shown within 3km if they pass independence checks, regardless of rating.
- **Google Places API** — Real-time nearby results fetched via Supabase Edge Function. Filtered to ≥4.4 rating and coffee-first venues only (chains, pubs, restaurants excluded). Merged at runtime — only appended if the shop name isn't already in the curated set.
- **Independence criteria** — A shop is shown from the curated set if: not a known chain (Costa, Starbucks, Caffe Nero, Gail's, Blank Street, Pret, Greggs, etc.), not a chain bakery (Ole & Steen, Paul), ≤5 locations, and Google rating ≥4.0. Venues excluded from the API feed by Google type (pubs, bars) must be added manually to `shops.ts`.
- **Reddit reviews** — Pre-scraped community sentiment data in `src/data/redditReviews.ts`
- **OpenStreetMap** — Map tiles (no API key required)
