import { useParams, useNavigate } from "react-router-dom";
import { coffeeShops } from "@/data/coffeeShops";
import { redditReviewsByShop, redditSentimentByShop } from "@/data/redditReviews";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Coffee } from "lucide-react";
import { ShopHero } from "@/components/shop/ShopHero";
import { ShopInfoCard } from "@/components/shop/ShopInfoCard";
import { ShopFeatures } from "@/components/shop/ShopFeatures";
import { ShopCommunity } from "@/components/shop/ShopCommunity";
import { ShopRedditReviews } from "@/components/shop/ShopRedditReviews";
import { ShopPhotos } from "@/components/shop/ShopPhotos";
import { ShopTransport } from "@/components/shop/ShopTransport";

export default function ShopProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const shop = coffeeShops.find((s) => s.id === id);
  const redditReviews = id ? redditReviewsByShop[id] || [] : [];
  const redditSentiment = id ? redditSentimentByShop[id] : undefined;

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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />

      {/* Back nav */}
      <div className="px-4 py-2 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground -ml-2"
          onClick={() => navigate("/")}
        >
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
        <ShopHero shop={shop} />

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

          <ShopInfoCard shop={shop} />
          <ShopCommunity communityReview={shop.communityReview} sentimentTags={shop.sentimentTags} />
          <ShopRedditReviews reviews={redditReviews} sentiment={redditSentiment} />
          <ShopFeatures attributes={shop.attributes} />
          <ShopPhotos photos={shop.photos} shopName={shop.name} />
          <ShopTransport nearestTransport={shop.nearestTransport} lat={shop.lat} lng={shop.lng} />
        </div>
      </motion.div>
    </div>
  );
}
