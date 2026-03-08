import { CoffeeShop, isIndependentVerified } from "@/data/coffeeShops";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, MapPin } from "lucide-react";

interface ShopHeroProps {
  shop: CoffeeShop;
}

export function ShopHero({ shop }: ShopHeroProps) {
  return (
    <div className="relative">
      <img
        src={shop.image}
        alt={shop.name}
        className="w-full h-56 md:h-72 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4">
        {isIndependentVerified(shop) && (
          <Badge className="bg-success text-success-foreground gap-1 mb-2">
            <BadgeCheck className="h-3.5 w-3.5" />
            Independent Verified
          </Badge>
        )}
        <h1 className="font-heading text-2xl md:text-3xl text-card">
          {shop.name}
        </h1>
        <div className="flex items-center gap-1.5 mt-1 text-card/80 text-sm">
          <MapPin className="h-3.5 w-3.5" />
          {shop.address} · {shop.neighborhood}
        </div>
      </div>
    </div>
  );
}
