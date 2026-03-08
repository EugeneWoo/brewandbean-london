import { MapPin, Navigation, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LocationState } from "@/hooks/useUserLocation";

/** Preset areas for the fallback picker */
const AREA_PRESETS: { label: string; lat: number; lng: number }[] = [
  { label: "Borough / South Bank", lat: 51.5035, lng: -0.089 },
  { label: "Shoreditch / East", lat: 51.527, lng: -0.082 },
  { label: "Fitzrovia / West End", lat: 51.519, lng: -0.139 },
  { label: "Clerkenwell / Farringdon", lat: 51.521, lng: -0.109 },
  { label: "Hackney / Broadway Market", lat: 51.535, lng: -0.061 },
  { label: "Dalston", lat: 51.546, lng: -0.075 },
  { label: "City of London", lat: 51.512, lng: -0.094 },
  { label: "Holloway / North London", lat: 51.551, lng: -0.115 },
  { label: "Covent Garden", lat: 51.514, lng: -0.121 },
];

interface LocationBarProps {
  locationState: LocationState;
}

export function LocationBar({ locationState }: LocationBarProps) {
  const { nearestNeighborhood, nearbyCount, status, setManualLocation, retry } =
    locationState;

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
          {AREA_PRESETS.map((area) => (
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
