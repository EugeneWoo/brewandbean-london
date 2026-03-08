import { CoffeeShop } from "@/data/coffeeShops";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock, Coffee, Phone, Globe, Instagram,
  ExternalLink, ChevronDown, ChevronUp,
} from "lucide-react";
import { useState } from "react";

interface ShopInfoCardProps {
  shop: CoffeeShop;
}

export function ShopInfoCard({ shop }: ShopInfoCardProps) {
  const [showAllHours, setShowAllHours] = useState(false);
  const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
  const todayHours = shop.hours[today] || "Hours unavailable";

  return (
    <Card className="p-4 space-y-3">
      {/* Hours */}
      <div
        className="flex items-center gap-2 text-sm cursor-pointer"
        onClick={() => setShowAllHours(!showAllHours)}
      >
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span>Today: {todayHours}</span>
        {showAllHours ? (
          <ChevronUp className="h-4 w-4 ml-auto text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" />
        )}
      </div>
      {showAllHours && (
        <div className="pl-6 space-y-1 text-sm text-muted-foreground">
          {Object.entries(shop.hours).map(([day, hours]) => (
            <div key={day} className="flex justify-between">
              <span className={day === today ? "font-semibold text-foreground" : ""}>{day}</span>
              <span className={day === today ? "font-semibold text-foreground" : ""}>{hours}</span>
            </div>
          ))}
        </div>
      )}

      {/* Roaster */}
      {shop.roaster && (
        <div className="flex items-center gap-2 text-sm">
          <Coffee className="h-4 w-4 text-muted-foreground" />
          <span>Roaster: <strong>{shop.roaster}</strong></span>
        </div>
      )}

      {/* Contact links */}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
          <a href={`tel:${shop.phone}`}>
            <Phone className="h-3.5 w-3.5" />{shop.phone}
          </a>
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
          <a href={shop.website} target="_blank" rel="noopener">
            <Globe className="h-3.5 w-3.5" />Website<ExternalLink className="h-3 w-3" />
          </a>
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
          <a href={`https://instagram.com/${shop.instagram.replace("@", "")}`} target="_blank" rel="noopener">
            <Instagram className="h-3.5 w-3.5" />{shop.instagram}
          </a>
        </Button>
      </div>
    </Card>
  );
}
