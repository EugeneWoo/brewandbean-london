import { useParams, useNavigate } from "react-router-dom";
import { coffeeShops, isIndependentVerified } from "@/data/coffeeShops";
import { redditReviewsByShop } from "@/data/redditReviews";
import { AppHeader } from "@/components/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  MapPin,
  Phone,
  Globe,
  Instagram,
  ExternalLink,
  Clock,
  Coffee,
  Laptop,
  Users,
  Dog,
  UtensilsCrossed,
  Armchair,
  Sunrise,
  Moon,
  Navigation,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ArrowUpRight,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";

const attributeConfig = [
  { key: "specialtyCoffee", label: "Specialty Coffee", icon: Coffee },
  { key: "laptopFriendly", label: "Laptop Friendly", icon: Laptop },
  { key: "kidsFriendly", label: "Kids Friendly", icon: Users },
  { key: "dogFriendly", label: "Dog Friendly", icon: Dog },
  { key: "foodMenu", label: "Food Menu", icon: UtensilsCrossed },
  { key: "sitIn", label: "Sit-in Space", icon: Armchair },
  { key: "opensEarly", label: "Opens Early", icon: Sunrise },
  { key: "opensLate", label: "Opens Late", icon: Moon },
];

export default function ShopProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAllHours, setShowAllHours] = useState(false);

  const shop = coffeeShops.find((s) => s.id === id);

  if (!shop) {
    return (
      <div className="flex flex-col h-screen">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Coffee className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="font-heading text-2xl">Shop not found</h2>
            <Button variant="outline" onClick={() => navigate("/")}>Back to map</Button>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
  const todayHours = shop.hours[today] || "Hours unavailable";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />

      {/* Back nav */}
      <div className="px-4 py-2 border-b border-border">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
          Back to map
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1"
      >
        {/* Hero */}
        <div className="relative">
          <img src={shop.image} alt={shop.name} className="w-full h-56 md:h-72 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            {isIndependentVerified(shop) && (
              <Badge className="bg-success text-success-foreground gap-1 mb-2">
                <BadgeCheck className="h-3.5 w-3.5" />
                Independent Verified
              </Badge>
            )}
            <h1 className="font-heading text-2xl md:text-3xl text-card">{shop.name}</h1>
            <div className="flex items-center gap-1.5 mt-1 text-card/80 text-sm">
              <MapPin className="h-3.5 w-3.5" />
              {shop.address} · {shop.neighborhood}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${shop.isOpen ? "bg-success" : "bg-destructive"}`} />
              <span className="font-medium text-sm">{shop.isOpen ? "Open now" : "Closed"}</span>
            </div>
            {!shop.isOpen && shop.nextOpenTime && (
              <span className="text-xs text-muted-foreground">Opens {shop.nextOpenTime}</span>
            )}
          </div>

          {/* Essential Info */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm cursor-pointer" onClick={() => setShowAllHours(!showAllHours)}>
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Today: {todayHours}</span>
              {showAllHours ? <ChevronUp className="h-4 w-4 ml-auto text-muted-foreground" /> : <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" />}
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
            {shop.roaster && (
              <div className="flex items-center gap-2 text-sm">
                <Coffee className="h-4 w-4 text-muted-foreground" />
                <span>Roaster: <strong>{shop.roaster}</strong></span>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
                <a href={`tel:${shop.phone}`}><Phone className="h-3.5 w-3.5" />{shop.phone}</a>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
                <a href={shop.website} target="_blank" rel="noopener"><Globe className="h-3.5 w-3.5" />Website<ExternalLink className="h-3 w-3" /></a>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
                <a href={`https://instagram.com/${shop.instagram.replace("@", "")}`} target="_blank" rel="noopener"><Instagram className="h-3.5 w-3.5" />{shop.instagram}</a>
              </Button>
            </div>
          </Card>

          {/* Community Insights */}
          <div className="space-y-3">
            <h2 className="font-heading text-xl">Community Insights</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{shop.communityReview}</p>
            <div className="flex flex-wrap gap-1.5">
              {shop.sentimentTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs font-normal">{tag}</Badge>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground/70 italic">
              Based on community reviews from Google, Reddit, and local recommendations
            </p>
          </div>

          {/* Attributes */}
          <div className="space-y-3">
            <h2 className="font-heading text-xl">Shop Features</h2>
            <div className="grid grid-cols-2 gap-2">
              {attributeConfig.map(({ key, label, icon: Icon }) => {
                const has = shop.attributes[key as keyof typeof shop.attributes];
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm ${
                      has ? "border-success/30 bg-success/5 text-foreground" : "border-border bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${has ? "text-success" : ""}`} />
                    {label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-3">
            <h2 className="font-heading text-xl">Photos</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {shop.photos.map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt={`${shop.name} photo ${i + 1}`}
                  className="h-40 w-56 rounded-lg object-cover shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Transport */}
          <div className="space-y-3 pb-8">
            <h2 className="font-heading text-xl">Getting There</h2>
            <div className="space-y-2">
              {shop.nearestTransport.map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Navigation className="h-4 w-4" />
                  {t}
                </div>
              ))}
            </div>
            <Button variant="outline" className="gap-2" asChild>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`}
                target="_blank"
                rel="noopener"
              >
                <MapPin className="h-4 w-4" />
                Get Directions
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
