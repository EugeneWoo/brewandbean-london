import { useMemo, useState, useRef } from "react";
import { MapPin, Navigation, ChevronDown, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { LocationState } from "@/hooks/useUserLocation";
import { coffeeShops } from "@/data/coffeeShops";

/** Zone classification based on neighbourhood name */
const ZONE_1: string[] = [
  "Soho", "Fitzrovia", "Clerkenwell", "City of London", "Bloomsbury",
  "Borough", "Bermondsey", "Shoreditch", "Covent Garden", "Holborn",
];

const ZONE_2: string[] = [
  "Islington", "Hackney", "Haggerston", "Dalston", "Bethnal Green",
  "Victoria Park", "Peckham", "Brixton", "Clapham", "Kentish Town",
  "Deptford", "Waterloo",
];

// Everything else is Zone 3+

interface AreaPreset {
  label: string;
  lat: number;
  lng: number;
  zone: number;
}

function deriveAreaPresets(): AreaPreset[] {
  const groups: Record<string, { lats: number[]; lngs: number[] }> = {};
  for (const shop of coffeeShops) {
    if (!groups[shop.neighborhood]) {
      groups[shop.neighborhood] = { lats: [], lngs: [] };
    }
    groups[shop.neighborhood].lats.push(shop.lat);
    groups[shop.neighborhood].lngs.push(shop.lng);
  }
  return Object.entries(groups)
    .map(([label, { lats, lngs }]) => {
      const zone = ZONE_1.includes(label) ? 1 : ZONE_2.includes(label) ? 2 : 3;
      return {
        label,
        lat: lats.reduce((a, b) => a + b, 0) / lats.length,
        lng: lngs.reduce((a, b) => a + b, 0) / lngs.length,
        zone,
      };
    })
    .sort((a, b) => a.zone - b.zone || a.label.localeCompare(b.label));
}

interface LocationBarProps {
  locationState: LocationState;
}

export function LocationBar({ locationState }: LocationBarProps) {
  const { nearestNeighborhood, nearbyCount, status, setManualLocation, retry } =
    locationState;
  const areaPresets = useMemo(() => deriveAreaPresets(), []);
  const [expandedZone, setExpandedZone] = useState(1);
  const [showPostcodeInput, setShowPostcodeInput] = useState(false);
  const [postcode, setPostcode] = useState("");
  const [postcodeError, setPostcodeError] = useState<string | null>(null);
  const [postcodeLoading, setPostcodeLoading] = useState(false);
  const postcodeInputRef = useRef<HTMLInputElement>(null);

  async function handlePostcodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = postcode.replace(/\s+/g, "").toUpperCase();
    if (!clean) return;
    setPostcodeLoading(true);
    setPostcodeError(null);
    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${clean}`);
      const data = await res.json();
      if (data.status === 200 && data.result) {
        setManualLocation(data.result.latitude, data.result.longitude);
        setShowPostcodeInput(false);
        setPostcode("");
      } else {
        setPostcodeError("Postcode not found");
      }
    } catch {
      setPostcodeError("Could not look up postcode");
    } finally {
      setPostcodeLoading(false);
    }
  }

  const visibleAreas = areaPresets.filter((a) => a.zone <= expandedZone);
  const hasMore = areaPresets.some((a) => a.zone > expandedZone);
  const nextZoneLabel = expandedZone === 1 ? "Zone 2" : expandedZone === 2 ? "Zone 3+" : "";

  return (
    <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
      {/* Postcode input form (shown inline when active) */}
      {showPostcodeInput ? (
        <form onSubmit={handlePostcodeSubmit} className="flex items-center gap-1.5">
          <Input
            ref={postcodeInputRef}
            value={postcode}
            onChange={(e) => { setPostcode(e.target.value); setPostcodeError(null); }}
            placeholder="e.g. TW11 0ED"
            className="h-8 w-32 rounded-full text-sm bg-background/95 backdrop-blur-sm shadow-md border-border"
            autoFocus
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
          />
          <Button
            type="submit"
            size="sm"
            className="rounded-full h-8 px-3 shadow-md"
            disabled={postcodeLoading}
          >
            {postcodeLoading ? "…" : "Go"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full h-8 px-3 shadow-md bg-background/95 backdrop-blur-sm"
            onClick={() => { setShowPostcodeInput(false); setPostcodeError(null); setPostcode(""); }}
          >
            Cancel
          </Button>
          {postcodeError && (
            <span className="text-xs text-destructive bg-background/95 px-2 py-1 rounded-full shadow-md">
              {postcodeError}
            </span>
          )}
        </form>
      ) : (
        <>
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

          {/* Safari-safe direct geolocation button — plain button, no Radix async indirection */}
          {status !== "granted" && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-8 w-8 p-0 shadow-md bg-background/95 backdrop-blur-sm"
              onClick={retry}
              title="Use my location"
            >
              <Navigation className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Area picker */}
          <DropdownMenu onOpenChange={() => setExpandedZone(1)}>
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
            <DropdownMenuContent align="start" className="w-56 max-h-[360px] overflow-y-auto">
              <DropdownMenuItem onClick={retry} className="gap-2">
                <Navigation className="h-3.5 w-3.5" />
                Use my location
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setShowPostcodeInput(true);
                  setTimeout(() => postcodeInputRef.current?.focus(), 50);
                }}
                className="gap-2"
              >
                <Search className="h-3.5 w-3.5" />
                Enter postcode
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {visibleAreas.map((area) => (
                <DropdownMenuItem
                  key={area.label}
                  onClick={() => setManualLocation(area.lat, area.lng)}
                  className="gap-2"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {area.label}
                </DropdownMenuItem>
              ))}
              {hasMore && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      setExpandedZone((z) => z + 1);
                    }}
                    className="gap-2 text-muted-foreground"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                    More locations ({nextZoneLabel})
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}
