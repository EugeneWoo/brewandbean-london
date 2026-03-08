import type { CoffeeShop } from "@/data/coffeeShops";
import { isIndependentVerified } from "@/data/coffeeShops";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Star, MapPin, Clock } from "lucide-react";

interface NearbyShopCardProps {
  shop: CoffeeShop;
  rank: number;
  distanceKm: number;
  onClick: () => void;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export function NearbyShopCard({ shop, rank, distanceKm, onClick }: NearbyShopCardProps) {
  const verified = isIndependentVerified(shop);

  return (
    <button
      onClick={onClick}
      className="w-full flex gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all text-left group"
    >
      {/* Rank badge */}
      <div className="shrink-0 flex flex-col items-center gap-1.5">
        <span className="w-7 h-7 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
          {rank}
        </span>
      </div>

      {/* Image */}
      <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
        {shop.image ? (
          <img
            src={shop.image}
            alt={shop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No photo
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start gap-1.5">
          <h3 className="font-body font-semibold text-sm text-foreground leading-tight truncate">
            {shop.name}
          </h3>
          {verified && (
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-success mt-0.5" />
          )}
        </div>

        {/* Rating + distance row */}
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {shop.verification.googleRating.toFixed(1)}
            {shop.totalRatings > 0 && (
              <span className="text-muted-foreground ml-0.5">
                ({shop.totalRatings > 999 ? `${(shop.totalRatings / 1000).toFixed(1)}k` : shop.totalRatings})
              </span>
            )}
          </span>
          <span className="inline-flex items-center gap-0.5 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {formatDistance(distanceKm)}
          </span>
        </div>

        {/* Address */}
        <p className="text-[11px] text-muted-foreground truncate">
          {shop.address || shop.neighborhood}
        </p>

        {/* Open/closed */}
        <div className="flex items-center gap-1.5">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${shop.isOpen ? "bg-success" : "bg-destructive"}`} />
          <span className="text-[11px] text-muted-foreground">
            {shop.isOpen ? "Open now" : "Closed"}
          </span>
        </div>
      </div>
    </button>
  );
}
