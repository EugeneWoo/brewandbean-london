import { useMemo } from "react";
import { MapPin, Navigation, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LocationState } from "@/hooks/useUserLocation";
import { coffeeShops } from "@/data/coffeeShops";

/** Derive unique areas from shop data, using the average lat/lng of shops in each neighbourhood */
function deriveAreaPresets(): { label: string; lat: number; lng: number }[] {
  const groups: Record<string, { lats: number[]; lngs: number[] }> = {};
  for (const shop of coffeeShops) {
    if (!groups[shop.neighborhood]) {
      groups[shop.neighborhood] = { lats: [], lngs: [] };
    }
    groups[shop.neighborhood].lats.push(shop.lat);
    groups[shop.neighborhood].lngs.push(shop.lng);
  }
  return Object.entries(groups)
    .map(([label, { lats, lngs }]) => ({
      label,
      lat: lats.reduce((a, b) => a + b, 0) / lats.length,
      lng: lngs.reduce((a, b) => a + b, 0) / lngs.length,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

interface LocationBarProps {
  locationState: LocationState;
}

export function LocationBar({ locationState }: LocationBarProps) {
  const { nearestNeighborhood, nearbyCount, status, setManualLocation, retry } =
    locationState;
  const areaPresets = useMemo(() => deriveAreaPresets(), []);

  return (
    <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
      {/* Status pill */}
      <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border rounded-full px-3 py-1.5 shadow-md text-sm">
        {status === "loading" && (
          <>
            <Navigation className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="text-muted-foreground">Locating…</span>
          </>
        )}

        {(status === "granted" || status === "manual") && nearestNeighborhood && (
          <>
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground font-medium">
              Near {nearestNeighborhood}
            </span>
            <span className="text-muted-foreground">
              · {nearbyCount} {nearbyCount === 1 ? "shop" : "shops"} nearby
            </span>
          </>
        )}

        {status === "denied" && (
          <>
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Choose your area</span>
          </>
        )}
      </div>

      {/* Area picker (shown on denied, or as override) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full h-8 gap-1 shadow-md bg-background/95 backdrop-blur-sm"
          >
            <ChevronDown className="h-3.5 w-3.5" />
            {status === "denied" ? "Select area" : "Change"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {status !== "granted" && (
            <DropdownMenuItem onClick={retry} className="gap-2">
              <Navigation className="h-3.5 w-3.5" />
              Use my location
            </DropdownMenuItem>
          )}
          {areaPresets.map((area) => (
            <DropdownMenuItem
              key={area.label}
              onClick={() => setManualLocation(area.lat, area.lng)}
              className="gap-2"
            >
              <MapPin className="h-3.5 w-3.5" />
              {area.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
