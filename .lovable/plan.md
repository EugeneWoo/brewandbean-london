

## Plan: Wire up Independent Verified badge conditionally

The `isIndependentVerified()` function already exists in `coffeeShops.ts` with the four criteria (chain exclusion, ≤5 locations, ≥4.0 Google rating, sufficient info). Two components need updating to use it:

### Changes

1. **`src/components/ShopPreviewCard.tsx`** — Import `isIndependentVerified`, conditionally render the "Verified" badge only when `isIndependentVerified(shop)` returns true.

2. **`src/pages/ShopProfile.tsx`** — Same conditional logic for the "Independent Verified" badge on the full profile page.

Both are small edits — wrapping the existing badge JSX in `{isIndependentVerified(shop) && (...)}`.

### Google Maps API key
Not needed yet — the map uses free CartoDB/Leaflet tiles. The key will be useful later if we integrate Google Places for real ratings, reviews, or place details.

