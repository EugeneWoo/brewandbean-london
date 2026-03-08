import { CoffeeShop, isIndependentVerified } from "@/data/coffeeShops";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BadgeCheck, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ShopPreviewCardProps {
  shop: CoffeeShop;
}

export function ShopPreviewCard({ shop }: ShopPreviewCardProps) {
  const navigate = useNavigate();

  return (
    <div className="w-[260px]">
      <img
        src={shop.image}
        alt={shop.name}
        className="w-full h-32 object-cover"
      />
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-body font-semibold text-sm leading-tight text-foreground">
            {shop.name}
          </h3>
          {isIndependentVerified(shop) && (
            <Badge variant="outline" className="shrink-0 text-[10px] border-success text-success bg-success/10 gap-0.5">
              <BadgeCheck className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          <MapPin className="h-3 w-3" />
          {shop.neighborhood}
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${shop.isOpen ? "bg-success" : "bg-destructive"}`} />
          <span className="text-xs text-muted-foreground">
            {shop.isOpen ? "Open now" : `Closed · ${shop.nextOpenTime || "Check hours"}`}
          </span>
        </div>
        <Button
          size="sm"
          className="w-full mt-1"
          onClick={() => navigate(`/shop/${shop.id}`)}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
