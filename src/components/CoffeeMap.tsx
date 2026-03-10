import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker, Pane } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CoffeeShop } from "@/data/coffeeShops";
import { ShopPreviewCard } from "./ShopPreviewCard";
import { redditReviewsByShop, redditSentimentByShop } from "@/data/redditReviews";
import type { UserLocation } from "@/hooks/useUserLocation";

const CITY_OF_LONDON: [number, number] = [51.515, -0.09];

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

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Snaps the map to user location once when it first arrives, then stays out of the way.
 * Re-snaps only if the user's location changes significantly (>500m).
 */
function MapLocationSnap({ center, shops }: { center: [number, number]; shops: CoffeeShop[] }) {
  const map = useMap();

  useEffect(() => {
    const closeShops = shops
      .filter((s) => haversineKm(center[0], center[1], s.lat, s.lng) <= 2)
      .slice(0, 8);

    if (closeShops.length === 0) {
      map.setView(center, 15, { animate: true });
      return;
    }
    const bounds = L.latLngBounds([center]);
    closeShops.forEach((s) => bounds.extend([s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15, animate: true });
  }, [center[0], center[1]]);
  return null;
}

interface CoffeeMapProps {
  filteredShops: CoffeeShop[];
  selectedShop: string | null;
  onSelectShop: (id: string | null) => void;
  userLocation: UserLocation | null;
  locationStatus: "loading" | "granted" | "denied" | "manual";
}

export function CoffeeMap({ filteredShops, selectedShop, onSelectShop, userLocation, locationStatus }: CoffeeMapProps) {
  // While locating: stay wherever we are (no premature snap to wrong place)
  // Denied with no location: fall back to City of London as last resort
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : CITY_OF_LONDON;

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

      {/* Snap to user location once on arrival, re-snap only on significant movement */}
      {userLocation && <MapLocationSnap center={[userLocation.lat, userLocation.lng]} shops={filteredShops} />}

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
              click: () => onSelectShop(selectedShop === shop.id ? null : shop.id),
              popupclose: () => onSelectShop(null),
            }}
          >
            <Popup>
              <ShopPreviewCard shop={shop} hasRedditBuzz={buzz} />
            </Popup>
          </Marker>
        );
      })}

      {/* User location — rendered AFTER markers so it stays on top */}
      {userLocation && (
        <Pane name="user-location" style={{ zIndex: 650 }}>
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={20}
            pathOptions={{
              fillColor: "hsl(217, 91%, 60%)",
              fillOpacity: 0.15,
              color: "hsl(217, 91%, 60%)",
              weight: 1.5,
              opacity: 0.4,
            }}
          />
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={10}
            pathOptions={{
              fillColor: "hsl(217, 100%, 55%)",
              fillOpacity: 1,
              color: "white",
              weight: 3.5,
            }}
          >
            <Popup>
              <div className="text-xs font-medium p-1">📍 You are here</div>
            </Popup>
          </CircleMarker>
        </Pane>
      )}
    </MapContainer>
  );
}
