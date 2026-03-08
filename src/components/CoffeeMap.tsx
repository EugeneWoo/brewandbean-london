import { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CoffeeShop } from "@/data/coffeeShops";
import { ShopPreviewCard } from "./ShopPreviewCard";
import { redditReviewsByShop, redditSentimentByShop } from "@/data/redditReviews";
import type { UserLocation } from "@/hooks/useUserLocation";

const DEFAULT_CENTER: [number, number] = [51.515, -0.09];

function hasRedditBuzz(shopId: string): boolean {
  return !!(redditReviewsByShop[shopId]?.length || redditSentimentByShop[shopId]);
}

function createPinIcon(active: boolean, rating: number, hasBuzz: boolean) {
  const color = active ? "#FF3008" : "#737373";
  const size = active ? 38 : 32;
  const buzzDot = hasBuzz
    ? `<span style="position:absolute;top:-2px;right:-2px;width:8px;height:8px;background:#8B5CF6;border-radius:50%;border:1.5px solid white;"></span>`
    : "";
  return L.divIcon({
    className: "",
    iconSize: [size, size + 16],
    iconAnchor: [size / 2, size + 16],
    popupAnchor: [0, -(size + 12)],
    html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
      <div style="
        position:relative;
        width:${size}px;height:${size}px;
        background:${color};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:2.5px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        display:flex;align-items:center;justify-content:center;
        transition:all 0.2s ease;
      ">
        <span style="transform:rotate(45deg);font-size:${active ? 16 : 14}px;">☕</span>
        ${buzzDot}
      </div>
      <span style="
        margin-top:2px;
        background:white;
        color:#333;
        font-size:10px;
        font-weight:600;
        padding:1px 4px;
        border-radius:4px;
        box-shadow:0 1px 3px rgba(0,0,0,0.15);
        font-family:'DM Sans',sans-serif;
        line-height:1.2;
      ">★ ${rating.toFixed(1)}</span>
    </div>`,
  });
}

/** Fit map to show user location + nearby shops */
function MapAutoFit({ center, shops }: { center: [number, number]; shops: CoffeeShop[] }) {
  const map = useMap();
  useEffect(() => {
    if (shops.length === 0) {
      map.setView(center, 14, { animate: true });
      return;
    }
    const bounds = L.latLngBounds([center]);
    // Include only closest shops to keep zoom tight
    const sorted = [...shops]
      .map((s) => ({ s, d: Math.abs(s.lat - center[0]) + Math.abs(s.lng - center[1]) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 10);
    sorted.forEach(({ s }) => bounds.extend([s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16, animate: true });
  }, [center[0], center[1], shops.length]);
  return null;
}

interface CoffeeMapProps {
  filteredShops: CoffeeShop[];
  selectedShop: string | null;
  onSelectShop: (id: string | null) => void;
  userLocation: UserLocation | null;
}

export function CoffeeMap({ filteredShops, selectedShop, onSelectShop, userLocation }: CoffeeMapProps) {
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={14}
      className="h-full w-full"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Auto-fit to show user + shops */}
      {userLocation && <MapAutoFit center={[userLocation.lat, userLocation.lng]} shops={filteredShops} />}

      {filteredShops.map((shop) => {
        const buzz = hasRedditBuzz(shop.id);
        const icon = createPinIcon(
          selectedShop === shop.id,
          shop.verification.googleRating,
          buzz
        );
        return (
          <Marker
            key={shop.id}
            position={[shop.lat, shop.lng]}
            icon={icon}
            eventHandlers={{
              click: () => onSelectShop(shop.id),
            }}
          >
            <Popup>
              <ShopPreviewCard shop={shop} hasRedditBuzz={buzz} />
            </Popup>
          </Marker>
        );
      })}

      {/* User location blue dot — rendered AFTER shop markers to stay on top */}
      {userLocation && (
        <CircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={8}
          pathOptions={{
            fillColor: "hsl(217, 91%, 60%)",
            fillOpacity: 1,
            color: "white",
            weight: 3,
          }}
        >
          <Popup>
            <div className="text-xs font-medium p-1">📍 You are here</div>
          </Popup>
        </CircleMarker>
      )}
    </MapContainer>
  );
}
