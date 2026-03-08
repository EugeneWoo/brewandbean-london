import { Button } from "@/components/ui/button";
import { Navigation, MapPin, ExternalLink } from "lucide-react";

interface ShopTransportProps {
  nearestTransport: string[];
  lat: number;
  lng: number;
}

export function ShopTransport({ nearestTransport, lat, lng }: ShopTransportProps) {
  return (
    <div className="space-y-3 pb-8">
      <h2 className="font-heading text-xl">Getting There</h2>
      <div className="space-y-2">
        {nearestTransport.map((t) => (
          <div key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Navigation className="h-4 w-4" />
            {t}
          </div>
        ))}
      </div>
      <Button variant="outline" className="gap-2" asChild>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
          target="_blank"
          rel="noopener"
        >
          <MapPin className="h-4 w-4" />
          Get Directions
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </Button>
    </div>
  );
}
